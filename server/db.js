const shortid = require('shortid');
const Redis = require("ioredis");

const TOTAL_CARDS = 60;
const MAX_PLAYERS = 6;
const MIN_PLAYERS = 3;
let redis;

const connect = async () => {
    redis = new Redis();
    try {
        await redis.connect();
    } catch (err) { }
    return redis;
};

const createDeck = () => {
    const cards = [];

    for (const specialSuit of ['wizard', 'jester']) {
        for (let value = 0; value < 4; value++) {
            cards.push({ suit: specialSuit, number: null });
        }
    }

    for (const suit of ['spades', 'clubs', 'hearts', 'diamonds']) {
        for (let value = 0; value < 13; value++) {
            cards.push({ suit, number: value });
        }
    }
    return cards;
};

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
    await redis.sadd(['games', gameId]);
    return gameId;
};


const getGames = async () => {
    return redis.smembers('games');
};

const getGamePlayers = async (gameId) => {
    return redis.lrange(`${gameId}-players`, 0, -1);
};


const addPlayerToGame = async (gameId, username) => {
    let players = await getGamePlayers(gameId);
    if (players.length === MAX_PLAYERS) {
        throw new Error(`Game is already full`);
    }
    await redis.rpush(`${gameId}-players`, username);
    players = await getGamePlayers(gameId);
    return players.indexOf(username);
};

const setPlayerBet = async (gameId, playerId, round, bet) => {
    if (bet < 0) {
        throw new Error(`Invalid bet.Must be a number greater than or equal to 0`);
    }
    if (bet > round + 1) {
        throw new Error(`Invalid bet.Cannot be larger than the possible tricks(${round + 1})`)
    }
    return redis.set(`${gameId}-r${round}-p${playerId}-bet`, bet);
};

const getPlayerBet = async (gameId, playerId, round) => {
    return redis.get(`${gameId}-r${round}-p${playerId}-bet`);
};


const getLeadSuit = async (gameId, round, trick) => {
    return redis.get(`${gameId}-r${round}-t${trick}-leadsuit`);
};


const setLeadSuit = async (gameId, round, trick, suit) => {
    return redis.set(`${gameId}-r${round}-t${trick}-leadsuit`, suit);
};


const getTrumpSuit = async (gameId, round) => {
    return redis.get(`${gameId}-r${round}-trumpsuit`);
};


const getTrickLeader = async (gameId, round, trick) => {
    const leaders = await redis.lrange(`${gameId}-r${round}-trickleaders`, 0, -1);
    return leaders[trick];
};


const getTrickCards = async (gameId, round, trick) => {
    const cards = await redis.lrange(`${gameId}-r${round}-t${trick}-cards`, 0, -1);
    return cards.map(card => {
        const [suit, value] = card.split('-');
        return {
            suit,
            number: value === 'null'
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
    const cards = await redis.lrange(`${gameId}-r${round}-p${playerId}-cards`, 0, -1);
    return cards.map(card => {
        const [suit, value] = card.split('-');
        return {
            suit,
            number: value === 'null'
                ? null
                : Number.parseInt(value, 10)
        };
    });
};


const setPlayerCards = async (gameId, playerId, round, cards) => {
    await redis.del(`${gameId}-r${round}-p${playerId}-cards`);
    return redis.rpush(
        `${gameId}-r${round}-p${playerId}-cards`,
        ...cards.map(c => `${c.suit}-${c.number}`)
    );
};


const whosTurnIsIt = async (gameId) => {
    const [round, trick] = await Promise.all([
        getCurrentRound(gameId),
        getCurrentTrick(gameId),
    ]);
    const trickPlayers = await getTrickPlayers(gameId, round, trick);
    const [trickCards] = await Promise.all([

        getTrickCards(gameId, round, trick),
    ]);
    return trickPlayers[trickCards.length];
};


const playCard = async (gameId, playerId, cardSuit, cardValue) => {
    // check if it is this players turn
    const turnPlayer = await whosTurnIsIt(gameId);
    if (turnPlayer !== playerId) {
        throw new Error(`Invalid play: It is not this users(${playerId}) turn.Waiting for player ${turnPlayer} to complete their turn`);
    }
    // add the card to the cards played for this trick
    const [round, trick, players] = await Promise.all(
        getCurrentRound(gameId),
        getCurrentTrick(gameId),
        getGamePlayers(gameId),
    );

    // check if the user should play a different card
    let [leadSuit, playersCards, trickCards] = await Promise.all([
        getLeadSuit(gameId, round, trick),
        getPlayerCards(gameId, playerId, round),
        getTrickCards(gameId, round, trick),
    ]);

    let newLeadSuit = null;

    if (leadSuit === 'jester' && leadSuit !== cardSuit) {
        // set the lead suit
        await setLeadSuit(gameId, round, trick, cardSuit);
        leadSuit = cardSuit;
        newLeadSuit = cardSuit;
    }

    // check if the card is a wizard or jester
    if (!['jester', 'wizard', leadSuit].includes(cardSuit)) {
        // check if the user has any lead suit in their hand
        if (playersCards.some(c => c.suit === leadSuit)) {
            throw new Error(`Invalid Play.The user must play the lead suit(${leadSuit})`);
        }
    }

    // play the card
    const newCards = playersCards.filter(c => c.suit !== cardSuit || c.number !== cardValue);
    await Promise.all([
        redis.rpush(`${gameId}-r${round}-t${trick}-cards`, `${cardSuit}-${cardValue} `),
        redis.set(`${gameId}-r${round}-p${playerId} `),
        setPlayerCards(gameId, playerId, round, newCards),
    ]);

    // if this was the last card in the trick, evaluate the trick
    const trickComplete = Boolean(trickCards.length + 1 === players.length);
    let trickWinner = null;
    const roundComplete = trickComplete && trick === round;
    if (trickComplete) {
        trickWinner = await evaluateTrick(gameId, round, trick);

        if (!roundComplete) {
            await setCurrentTrick(trick + 1);
        } else {
            await Promise.all([
                setCurrentTrick(0),
                setCurrentRound(round + 1),
            ]);
        }
    }
    return { trickComplete, roundComplete, trickWinner, newLeadSuit };
};


const getCurrentRound = async (gameId) => {
    return redis.get(`${gameId}-current-round`);
};


const getCurrentTrick = async (gameId) => {
    return redis.get(`${gameId}-current-trick`);
};


const setCurrentRound = async (gameId, round) => {
    return redis.set(`${gameId}-current-round`, round);
};


const setCurrentTrick = async (gameId, trick) => {
    return redis.set(`${gameId}-current-trick`, trick);
};


const setPlayerSocket = async (gameId, playerId, socketId) => {
    return redis.set(`${gameId}-p${playerId}-socket`, socketId);
};


const getPlayerSocket = async (gameId, playerId) => {
    return redis.get(`${gameId}-p${playerId}-socket`);
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
            if (card1.number === card2.number) {
                return 0
            }
            return card1.number - card2.number;
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
const startRound = async (gameId) => {
    const [players, round] = await Promise.all([
        getGamePlayers(gameId),
        getCurrentRound(gameId),
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

    let trumpSuit = 'jester';
    if (cardsUsed < TOTAL_CARDS) {
        // select a trump card
        trumpSuit = deck[cardsUsed].suit;
    }
    promises.push(redis.set(
        `${gameId}-r${round}-trump`,
        trumpSuit
    ));

    for (const playerId of Object.keys(cards)) {
        promises.push(setPlayerCards(gameId, playerId, round, cards[playerId]));
    }

    await Promise.all(promises);
    return {
        cards, trump: trumpSuit,
    };
};


/**
 * This starts the game. At this point all the players are in. It will
 * initialize the score board for the number of players
 *
 * @param {string} gameId
 */
const startGame = async (gameId) => {
    const players = await getGamePlayers(gameId);
    if (players.length < MIN_PLAYERS) {
        throw new Error(`Too few players. Waiting for another player to join`);
    }
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
        setDealers.push(redis.set(`${gameId}-r${round}-dealer`, dealer));
        setDealers.push(redis.rpush(`${gameId}-r${round}-trickleaders`, trickLeader));
    }
    await Promise.all(setDealers);
    return startRound(gameId);
};

const deleteGame = async (gameId) => {
    const keys = await redis.keys(`${gameId}*`);
    // Use pipeline instead of sending
    // one command each time to improve the
    // performance.
    var pipeline = redis.pipeline();
    keys.forEach(function (key) {
        pipeline.del(key);
    });
    return pipeline.exec();
};


module.exports = {
    addPlayerToGame,
    close: () => redis && redis.quit(),
    connect,
    createGame,
    deleteGame,
    evaluateTrick,
    getCurrentRound,
    getCurrentTrick,
    getGamePlayers,
    getGames,
    getPlayerBet,
    getPlayerCards,
    getPlayerSocket,
    playCard,
    setCurrentRound,
    setCurrentTrick,
    setPlayerBet,
    setPlayerSocket,
    startGame,
    startRound,
    whosTurnIsIt,
};
