const { getPlayers } = require('./game');

const TOTAL_CARDS = 60;


const initializeArrayField = async (redis, field, length, value = -1) => {
    await redis.del(field);
    const fill = Array.from({ length }, () => value);
    await redis.rpush(field, ...fill);
};


const setTrickWinner = async (redis, gameId, round, trick, playerId) => {
    await redis.lset(`${gameId}-r${round}-taken`, trick, playerId);
};

const getTrickWinners = async (redis, gameId, round) => {
    return redis.lrange(`${gameId}-r${round}-taken`, 0, -1);
};

const getLeadSuit = async (redis, gameId, round, trick) => {
    return redis.get(`${gameId}-r${round}-t${trick}-leadsuit`);
};


const setLeadSuit = async (redis, gameId, round, trick, suit) => {
    return redis.set(`${gameId}-r${round}-t${trick}-leadsuit`, suit);
};


const getTrickLeader = async (redis, gameId, round, trick) => {
    const leaders = await redis.lrange(`${gameId}-r${round}-trickleaders`, 0, -1);
    return leaders[trick];
};


const getTrickCards = async (redis, gameId, round, trick) => {
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


const getTrickPlayers = async (redis, gameId, round, trick) => {
    const [players, trickLeader] = await Promise.all([
        getPlayers(redis, gameId),
        getTrickLeader(redis, gameId, round, trick),
    ]);

    const trickPlayers = [];
    for (let i = 0; i < players.length; i++) {
        const playerId = (trickLeader + i) % players.length;
        trickPlayers.push(playerId)
    }
    return trickPlayers;
};


const whosTurnIsIt = async (redis, gameId) => {
    const [round, trick] = await Promise.all([
        getCurrentRound(redis, gameId),
        getCurrentTrick(redis, gameId),
    ]);
    const [trickPlayers, trickCards] = await Promise.all([
        getTrickPlayers(redis, gameId, round, trick),
        getTrickCards(redis, gameId, round, trick),
    ]);
    return trickPlayers[trickCards.length];
};


const playCard = async (redis, gameId, playerId, cardSuit, cardValue) => {
    // check if it is this players turn
    const turnPlayer = await whosTurnIsIt(redis, gameId);
    if (turnPlayer !== playerId) {
        throw new Error(`Invalid play: It is not this users (${playerId}) turn. Waiting for player ${turnPlayer} to complete their turn`);
    }
    // add the card to the cards played for this trick
    const [round, trick, players] = await Promise.all([
        getCurrentRound(redis, gameId),
        getCurrentTrick(redis, gameId),
        getPlayers(redis, gameId),
    ]);

    // check if the user should play a different card
    let [leadSuit, playersCards, trickCards, bets] = await Promise.all([
        getLeadSuit(redis, gameId, round, trick),
        getPlayerCards(redis, gameId, playerId, round),
        getTrickCards(redis, gameId, round, trick),
        getPlayerBets(redis, gameId, round),
    ]);

    if (bets.some(b => b < 0)) {
        throw new Error(`Cannot play card before all bets are in`);
    }

    let newLeadSuit = null;

    if ((leadSuit === 'jester' && leadSuit !== cardSuit) || !trickCards.length) {
        // set the lead suit
        await setLeadSuit(redis, gameId, round, trick, cardSuit);
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
        setPlayerCards(redis, gameId, playerId, round, newCards),
    ]);

    // if this was the last card in the trick, evaluate the trick
    const trickComplete = Boolean(trickCards.length + 1 === players.length);
    let trickWinner = null;
    const roundComplete = trickComplete && trick === round;
    if (trickComplete) {
        trickWinner = await evaluateTrick(redis, gameId, round, trick);

        if (!roundComplete) {
            await setCurrentTrick(redis, trick + 1);
        } else {
            await Promise.all([
                setCurrentTrick(redis, 0),
                setCurrentRound(redis, round + 1),
            ]);
        }
    }
    return { trickComplete, roundComplete, trickWinner, newLeadSuit };
};


const getCurrentTrick = async (redis, gameId) => {
    const trick = await redis.get(`${gameId}-current-trick`);
    // redis is dumb and stores this as a string
    return Number.parseInt(trick, 10);
};


const setCurrentTrick = async (redis, gameId, trick) => {
    return redis.set(
        `${gameId}-current-trick`,
        typeof trick === 'string'
            ? Number.parseInt(trick, 10)
            : trick
    );
};



const evaluateTrick = async (redis, gameId, round, trick) => {
    const [cards, players, leadSuit, trumpSuit] = await Promise.all([
        getTrickCards(redis, gameId, round, trick),
        getTrickPlayers(redis, gameId, round, trick),
        getLeadSuit(redis, gameId, round, trick),
        getTrumpSuit(redis, gameId, round),
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
            // aces are high cards
            if (card1.number === 1) {
                return -1;
            } if (card2.number === 1) {
                return 1;
            }
            // otherwise use values as normal
            return card2.number - card1.number;
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
    await setTrickWinner(redis, gameId, round, trick, best.playerId);
    return best.playerId;
};


const createDeck = () => {
    const cards = [];

    for (const specialSuit of ['wizard', 'jester']) {
        for (let value = 0; value < 4; value++) {
            cards.push({ suit: specialSuit, number: null });
        }
    }

    for (const suit of ['spades', 'clubs', 'hearts', 'diamonds']) {
        for (let value = 1; value < 14; value++) {
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


const getTrumpSuit = async (redis, gameId, round) => {
    return redis.get(`${gameId}-r${round}-trumpsuit`);
};



/**
 * get the remaining cards for a given player
 * @param {string} gameId
 * @param {Nuber} playerId
 * @param {Number?} round assumes the current round if this is not given
 */
const getPlayerCards = async (redis, gameId, playerId, round) => {
    if (round === undefined) {
        round = await getCurrentRound(redis, gameId);
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


const setPlayerCards = async (redis, gameId, playerId, round, cards) => {
    await redis.del(`${gameId}-r${round}-p${playerId}-cards`);
    if (cards.length) {
        return redis.rpush(
            `${gameId}-r${round}-p${playerId}-cards`,
            ...cards.map(c => `${c.suit}-${c.number}`)
        );
    }
};


const getCurrentRound = async (redis, gameId) => {
    const round = await redis.get(`${gameId}-current-round`);
    // redis is dumb and stores this as a string
    return Number.parseInt(round, 10);
};


const setCurrentRound = async (redis, gameId, round) => {
    return redis.set(
        `${gameId}-current-round`,
        typeof round === 'string'
            ? Number.parseInt(round, 10)
            : round
    );
};

/**
 * shuffles the deck, assigns cards to players and assigns the trump for the current round
 * @param {string} gameId
 */
const startRound = async (redis, gameId) => {
    const [players, round] = await Promise.all([
        getPlayers(redis, gameId),
        getCurrentRound(redis, gameId),
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
        promises.push(setPlayerCards(redis, gameId, playerId, round, cards[playerId]));
    }
    // default bets to -1
    promises.push(initializeArrayField(redis, `${gameId}-r${round}-bets`, players.length));
    promises.push(initializeArrayField(redis, `${gameId}-r${round}-taken`, round + 1));

    await Promise.all(promises);
    return {
        cards, trump: trumpSuit, round
    };
};


const getPlayerBets = async (redis, gameId, round) => {
    const bets = await redis.lrange(`${gameId}-r${round}-bets`, 0, -1);
    return bets;
};


/**
 *
 * @param {object} redis
 * @param {string} gameId
 * @param {Number} playerId
 * @param {Number} round
 * @param {Number} bet
 *
 * @returns {boolean} true if all players have made their bet
 */
const setPlayerBet = async (redis, gameId, playerId, round, bet) => {
    if (bet < 0) {
        throw new Error(`Invalid bet.Must be a number greater than or equal to 0`);
    }
    if (bet > round + 1) {
        throw new Error(`Invalid bet.Cannot be larger than the possible tricks(${round + 1})`)
    }
    const allBets = await getPlayerBets(redis, gameId, round);
    if (allBets[playerId] >= 0) {
        throw new Error(`Cannot set bet (${bet}). Bet has already been set (${allBets[playerId]})`);
    }
    await redis.lset(`${gameId}-r${round}-bets`, playerId, bet);
    allBets[playerId] = bet;
    return allBets.every(b => b >= 0);
};


module.exports = {
    evaluateTrick,
    getCurrentRound,
    getCurrentTrick,
    getPlayerBets,
    getPlayerCards,
    getTrickLeader,
    getTrickWinners,
    playCard,
    setCurrentRound,
    setCurrentTrick,
    setPlayerBet,
    startRound,
    whosTurnIsIt,
};
