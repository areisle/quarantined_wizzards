const shortid = require('shortid');
const redis = require("redis");
const { promisify } = require('util');

const TOTAL_CARDS = 60;
const client = redis.createClient();

const createDeck = () => {
    const cards = [
        ['wizard', null],
        ['wizard', null],
        ['wizard', null],
        ['wizard', null],
        ['jester', null],
        ['jester', null],
        ['jester', null],
        ['jester', null],
    ];

    for (const suit of ['spades', 'clubs', 'hearts', 'diamonds']) {
        for (let value = 1; value < 14; value++) {
            cards.push({ suit, value });
        }
    }
    return cards;
}

// use promises instead of callbacks
for (const fn of ['get', 'smembers', 'lrange', 'set', 'sadd']) {
    client[fn] = promisify(client[fn]).bind(client);
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
const shuffleYourDeck = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const createGame = async () => {
    const gameId = shortid.generate();
    await client.sadd(['games', gameId]);
    return gameId;
};

const getGames = async () => {
    return client.smembers('games');
}

const addPlayerToGame = async (gameId, username) => {
    await client.rpush(`${gameId}-players`, username);
    const players = await getGamePlayers();
    return players.indexOf(username);
};

const getGamePlayers = async (gameId) => {
    return client.lrange(`${gameId}-players`, 0, -1);
};

const getPlayerBet = async (gameId, playerId, round) => {
    return client.get(`${gameId}-r${round}-p${playerId}`);
};

const setPlayerBet = async (gameId, playerId, round, bet) => {
    if (bet < 0) {
        throw new Error(`Invalid bet. Must be a number greater than or equal to 0`);
    }
    if (bet > round + 1) {
        throw new Error(`Invalid bet. Cannot be larger than the possible tricks (${round + 1})`)
    }
    return client.set(`${gameId}-r${round}-p${playerId}`, bet);
};


const getLeadSuit = async (gameId, round, trick) => {
    return client.get(`${gameId}-r${round}-t${trick}-leadsuit`);
};

const setLeadSuit = async (gameId, round, trick, suit) => {
    return client.set(`${gameId}-r${round}-t${trick}-leadsuit`, suit);
}

const getTrumpSuit = async (gameId, round) => {
    return client.get(`${gameId}-r${round}-trumpsuit`);
};

const getTrickLeader = async (gameId, round, trick) => {
    return client.lrange(`${gameId}-r${round}-trickleaders`, trick, trick + 1);
};


const getTrickCards = async (gameId, round, trick) => {
    return client.lrange(`${gameId}-r${round}-t${trick}-cards`, 0, -1).map(card => {
        const [suit, value] = card.split('-');
        return {
            suit,
            value: value === 'null'
                ? null
                : Number.parseInt(value, 10)
        };
    });
};

const getTrickPlayers = async (gameId, round, trick) => {
    const [players, trickLeader] = await Promise.all([
        getGamePlayers(gameId),
        getTrickLeader(gameId, round, trick),
    ]);

    const trickPlayers = [];
    for (let i = 0; i < players.length; i++) {
        const playerId = (trickLeader + i) % players.length;
        trickPlayers.push(playerId)
    }
    return trickPlayers;
};


/**
 * get the remaining cards for a given player
 * @param {string} gameId
 * @param {Nuber} playerId
 * @param {Number?} round assumes the current round if this is not given
 */
const getPlayerCards = async (gameId, playerId, round) => {
    if (round === undefined) {
        round = await getCurrentRound(gameId);
    }
    return client.lrange(`${gameId}-r${round}-p${playerId}-cards`, 0, -1).map(card => {
        const [suit, value] = card.split('-');
        return {
            suit,
            value: value === 'null'
                ? null
                : Number.parseInt(value, 10)
        };
    });
};


const whosTurnIsIt = async (gameId) => {
    const [round, trick] = await Promise.all(
        getCurrentRound(gameId),
        getCurrentTrick(gameId),
    );
    const [trickPlayers, trickCards] = await Promise.all([
        getTrickPlayers(gameId, round, trick),
        getTrickCards(gameId, round, trick),
    ]);
    return trickPlayers[trickCards.length];
};


const playCard = async (gameId, playerId, cardSuit, cardValue) => {
    // check if it is this players turn
    const turnPlayer = await whosTurnIsIt(gameId);
    if (turnPlayer !== playerId) {
        throw new Error(`Invalid play: It is not this users (${playerId}) turn. Waiting for player ${turnPlayer} to complete their turn`);
    }
    // add the card to the cards played for this trick
    const [round, trick] = await Promise.all(
        getCurrentRound(gameId),
        getCurrentTrick(gameId),
    );

    // check if the user should play a different card
    let [leadSuit, playersCards] = await Promise.all([
        getLeadSuit(gameId, round, trick),
        getPlayerCards(gameId, playerId, round),
    ]);

    if (leadSuit === 'jester') {
        // set the lead suit
        await setLeadSuit(gameId, round, trick, cardSuit);
        leadSuit = cardSuit;
    }

    // check if the card is a wizard or jester
    if (!['jester', 'wizard', leadSuit].includes(cardSuit)) {
        // check if the user has any lead suit in their hand
        if (playersCards.some(c => c.suit === leadSuit)) {
            throw new Error(`Invalid Play. The user must play the lead suit (${leadSuit})`);
        }
    }

    // play the card
    return client.rpush(`${gameId}-r${round}-t${trick}-cards`, `${cardSuit}-${cardValue}`);
};

const getCurrentRound = async (gameId) => {
    return client.get(`${gameId}-current-round`);
};

const getCurrentTrick = async (gameId) => {
    return client.get(`${gameId}-current-trick`);
};

const setCurrentRound = async (gameId, round) => {
    return client.set(`${gameId}-current-round`, round);
};

const setCurrentTrick = async (gameId, trick) => {
    return client.set(`${gameId}-current-trick`, trick);
};

const evaluateTrick = async (gameId, round, trick) => {
    const [cards, players, leadSuit, trumpSuit] = await Promise.all([
        getTrickCards(gameId, round, trick),
        getTrickPlayers(gameId, round, trick),
        getLeadSuit(gameId, round, trick),
        getTrumpSuit(gameId, round),
    ]);

    const trickCards = cards.map((c, index) => {
        return { ...c, playerId: players[index] };
    });

    // a wizard was played. the first one played is the winner
    const firstWizard = trickCards.findIndex(t => t.suit === 'wizard');
    if (firstWizard >= 0) {
        return trickCards[firstWizard].playerId;
    }

    // if only jesters were played then the first jester wins
    if (trickCards.every(t => t.suit === 'jester')) {
        return trickCards[0].playerId;
    }

    const compareCards = (card1, card2) => {
        if (card1.suit === card2.suit) {
            if (card1.value === card2.value) {
                return 0
            }
            return card1.value - card2.value;
        }
        if (trumpSuit !== 'jester') { // not no trump
            if (card1.suit === trumpSuit) {
                return -1;
            } if (card2.suit === trumpSuit) {
                return 1;
            }
        }
        if (card1.suit === leadSuit) {
            return -1;
        } if (card2.suit === leadSuit) {
            return 1;
        }
        return 0;
    };

    const [best] = trickCards.sort(compareCards);
    return best.playerId;
};

/**
 * shuffles the deck, assigns cards to players and assigns the trump for the current round
 * @param {string} gameId
 */
const assignCardsToPlayers = async (gameId) => {
    const [players, round] = await Promise.all([
        getGamePlayers(gameId),
        getCurrentRound(gameId)
    ]);

    const deck = shuffleYourDeck(createDeck());
    const cards = {}

    for (let trick = 0; trick < round + 1; trick++) {
        for (let playerId = 0; playerId < players.length; playerId++) {
            if (cards[playerId] === undefined) {
                cards[playerId] = [];
            }
            cards[playerId].push(deck[trick + playerId]);
        }
    }

    const cardsUsed = (round + 1) * players.length;
    const promises = [];

    if (cardsUsed < TOTAL_CARDS) {
        // select a trump card
        promises.push(client.set(
            `${gameId}-r${round}-trump`,
            deck[cardsUsed].suit
        ));
    } else {
        promises.push(client.set(
            `${gameId}-r${round}-trump`,
            'jester'
        ));
    }

    for (const playerId of Object.keys(cards)) {
        promises.push(client.rpush(
            `${gameId}-r${round}-p${playerId}-suits`,
            cards[playerId].map(c => c.suit)
        ));
        promises.push(client.rpush(
            `${gameId}-r${round}-p${playerId}-values`,
            cards[playerId].map(c => c.value)
        ));
    }

    await Promise.all(promises);
};

/**
 * This starts the game. At this point all the players are in. It will
 * initialize the score board for the number of players
 *
 * @param {string} gameId
 */
const startGame = async (gameId) => {
    const players = await getGamePlayers(gameId);
    const rounds = TOTAL_CARDS / players.length;
    await Promise.all([
        setCurrentRound(gameId, 0),
        setCurrentTrick(gameId, 0)
    ]);

    // set the dealers and trick leaders for each round
    const setDealers = []
    for (let round = 0; round < rounds; round++) {
        const dealer = round % players.length;
        const trickLeader = dealer === 0
            ? players.length - 1
            : dealer - 1;
        setDealers.push(client.set(`${gameId}-r${round}-dealer`, dealer));
        setDealers.push(client.rpush(`${gameId}-r${round}-trickleaders`, trickLeader));
    }
    await Promise.all(setDealers);
};


module.exports = {
    addPlayerToGame,
    assignCardsToPlayers,
    createGame,
    evaluateTrick,
    getCurrentRound,
    getCurrentTrick,
    getGamePlayers,
    getGames,
    getPlayerBet,
    getPlayerCards,
    playCard,
    setCurrentRound,
    setCurrentTrick,
    setPlayerBet,
    startGame,
};
