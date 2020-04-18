import { Redis } from 'ioredis';

import { getPlayers, getPlayerIndex } from './game';
import { Suit, Card, GameState } from '../../src/types';
import { getGamePlayers } from '.';

const initializeArrayField = async (redis: Redis, field: string, length, value: number | string = -1) => {
    await redis.del(field);
    const fill = Array.from({ length }, () => value);
    await redis.rpush(field, ...fill);
};


const setTrickWinner = async (redis: Redis, gameId: string, roundNumber: number, trickNumber: number, playerId: string) => {
    await redis.lset(`${gameId}-r${roundNumber}-taken`, trickNumber, playerId);
};

const getTrickWinners = async (redis: Redis, gameId: string, roundNumber: number) => {
    return redis.lrange(`${gameId}-r${roundNumber}-taken`, 0, -1);
};

const getLeadSuit = async (redis: Redis, gameId: string, roundNumber: number, trickNumber: number) => {
    return redis.get(`${gameId}-r${roundNumber}-t${trickNumber}-leadsuit`) as Promise<Suit>;
};


const setLeadSuit = async (redis: Redis, gameId: string, roundNumber: number, trickNumber: number, suit: Suit) => {
    return redis.set(`${gameId}-r${roundNumber}-t${trickNumber}-leadsuit`, suit);
};

const getRoundDealer = async (redis: Redis, gameId: string, roundNumber: number) => {
    const players = await getPlayers(redis, gameId);
    return players[roundNumber % players.length];
};


const getTrickLeader = async (redis: Redis, gameId: string, roundNumber: number, trickNumber: number) => {
    if (trickNumber === 0) {
        const [dealer, players] = await Promise.all([
            getRoundDealer(redis, gameId, roundNumber),
            getPlayers(redis, gameId),
        ]);
        const pos = players.indexOf(dealer);
        return players[(pos + players.length - 1) % players.length];
    } else {
        const winners = await getTrickWinners(redis, gameId, roundNumber);
        return winners[trickNumber - 1];
    }
};


const getTrickCards = async (redis: Redis, gameId: string, roundNumber: number, trickNumber: number): Promise<Card[]> => {
    const cards = await redis.lrange(`${gameId}-r${roundNumber}-t${trickNumber}-cards`, 0, -1);
    return cards.map(card => {
        const [suit, value] = card.split('-') as [Suit, string];
        return {
            suit,
            number: value === 'null'
                ? null
                : Number.parseInt(value, 10)
        };
    });
};


const getTrickPlayers = async (redis: Redis, gameId: string, roundNumber: number, trickNumber: number) => {
    const [players, trickLeader] = await Promise.all([
        getPlayers(redis, gameId),
        getTrickLeader(redis, gameId, roundNumber, trickNumber),
    ]);

    const trickLeaderIndex = players.indexOf(trickLeader);

    const trickPlayers: string[] = [];

    for (let i = 0; i < players.length; i++) {
        const playerIndex = (trickLeaderIndex + i) % players.length;
        trickPlayers.push(players[playerIndex])
    }
    return trickPlayers;
};


const getTrickCardsByPlayer = async (redis: Redis, gameId: string, roundNumber: number, trickNumber: number) => {
    const [trickCards, trickPlayers] = await Promise.all([
        getTrickCards(redis, gameId, roundNumber, trickNumber),
        getTrickPlayers(redis, gameId, roundNumber, trickNumber),
    ]);
    const tricks: GameState['trickCards'] = {};
    trickCards.forEach((card, index) => {
        tricks[trickPlayers[index]] = card;
    });
    return tricks;
};


const whosTurnIsIt = async (redis: Redis, gameId: string) => {
    const [roundNumber, trickNumber] = await Promise.all([
        getCurrentRound(redis, gameId),
        getCurrentTrick(redis, gameId),
    ]);
    const [trickPlayers, trickCards] = await Promise.all([
        getTrickPlayers(redis, gameId, roundNumber, trickNumber),
        getTrickCards(redis, gameId, roundNumber, trickNumber),
    ]);
    return trickPlayers[trickCards.length];
};


const playCard = async (redis: Redis, gameId: string, playerId: string, cardSuit: Suit, cardValue: number) => {
    // check if it is this players turn
    const turnPlayer = await whosTurnIsIt(redis, gameId);
    if (turnPlayer !== playerId) {
        throw new Error(`Invalid play: It is not this users (${playerId}) turn. Waiting for another player (${turnPlayer}) to complete their turn`);
    }
    // add the card to the cards played for this trickNumber
    const [roundNumber, trickNumber, players] = await Promise.all([
        getCurrentRound(redis, gameId),
        getCurrentTrick(redis, gameId),
        getPlayers(redis, gameId),
    ]);

    // check if the user should play a different card
    let [leadSuit, playersCards, trickCards, bets] = await Promise.all([
        getLeadSuit(redis, gameId, roundNumber, trickNumber),
        getPlayerCards(redis, gameId, playerId, roundNumber),
        getTrickCards(redis, gameId, roundNumber, trickNumber),
        getPlayerBets(redis, gameId, roundNumber),
    ]);

    if (bets.some(b => b < 0)) {
        const betsWaiting = bets.map(
            (bet, index) => bet < 0
                ? players[index]
                : null
        ).filter(p => p !== null);
        throw new Error(`Cannot play card before all bets are in. Waiting for players (${betsWaiting.join(', ')})`);
    }

    let newLeadSuit: Suit | null = null;

    if ((leadSuit === 'jester' && leadSuit !== cardSuit) || !trickCards.length) {
        // set the lead suit
        await setLeadSuit(redis, gameId, roundNumber, trickNumber, cardSuit);
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
        redis.rpush(`${gameId}-r${roundNumber}-t${trickNumber}-cards`, `${cardSuit}-${cardValue} `),
        setPlayerCards(redis, gameId, playerId, roundNumber, newCards),
    ]);

    // if this was the last card in the trick, evaluate the trick
    const trickComplete = Boolean(trickCards.length + 1 === players.length);
    let trickWinner = null;
    if (trickComplete) {
        trickWinner = await evaluateTrick(redis, gameId, roundNumber, trickNumber);
    }
    return { trickWinner, newLeadSuit };
};


const currentTrickIsComplete = async (redis, gameId) => {
    const [roundNumber, trickNumber, players] = await Promise.all([
        getCurrentRound(redis, gameId),
        getCurrentTrick(redis, gameId),
        getGamePlayers(redis, gameId),
    ]);
    const trickCards = await getTrickCards(redis, gameId, roundNumber, trickNumber);
    return Boolean(trickCards.length === players.length);
};

const currentRoundIsComplete = async (redis, gameId) => {
    const [roundNumber, trickNumber, players] = await Promise.all([
        getCurrentRound(redis, gameId),
        getCurrentTrick(redis, gameId),
        getGamePlayers(redis, gameId),
    ]);
    const trickCards = await getTrickCards(redis, gameId, roundNumber, trickNumber);
    return Boolean(trickCards.length === players.length && trickNumber === roundNumber);
};


const getCurrentTrick = async (redis: Redis, gameId: string) => {
    const trickNumber = await redis.get(`${gameId}-current-trick`);
    // redis is dumb and stores this as a string
    return Number.parseInt(trickNumber, 10);
};


const setCurrentTrick = async (redis: Redis, gameId: string, trickNumber: number) => {
    return redis.set(
        `${gameId}-current-trick`,
        typeof trickNumber === 'string'
            ? Number.parseInt(trickNumber, 10)
            : trickNumber
    );
};



const evaluateTrick = async (redis: Redis, gameId: string, roundNumber: number, trickNumber: number) => {
    const [cards, trickPlayers, leadSuit, trumpSuit] = await Promise.all([
        getTrickCards(redis, gameId, roundNumber, trickNumber),
        getTrickPlayers(redis, gameId, roundNumber, trickNumber),
        getLeadSuit(redis, gameId, roundNumber, trickNumber),
        getTrumpSuit(redis, gameId, roundNumber),
    ]);

    const trickCards = cards.map((c, index) => {
        return { ...c, playerId: trickPlayers[index] };
    });

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

    // a wizard was played. the first one played is the winner
    const firstWizard = trickCards.findIndex(t => t.suit === 'wizard');
    let best;
    if (firstWizard >= 0) {
        best = trickCards[firstWizard].playerId;
    } else if (trickCards.every(t => t.suit === 'jester')) {
        // if only jesters were played then the first jester wins
        best = trickCards[0].playerId;
    } else {
        best = trickCards.sort(compareCards)[0].playerId;
    }
    await setTrickWinner(redis, gameId, roundNumber, trickNumber, best);
    return best;
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


const getTrumpSuit = async (redis: Redis, gameId: string, roundNumber: number) => {
    return redis.get(`${gameId}-r${roundNumber}-trump`) as Promise<Suit>;
};

const setTrumpSuit = async (redis: Redis, gameId: string, roundNumber: number, trump: string) => {
    return redis.set(`${gameId}-r${roundNumber}-trump`, trump);
};


/**
 * get the remaining cards for a given player
 * @param {string} gameId
 * @param {Nuber} playerId
 * @param {Number?} roundNumber assumes the current roundNumber if this is not given
 */
const getPlayerCards = async (redis: Redis, gameId: string, playerId: string, roundNumber: number) => {
    if (roundNumber === undefined) {
        roundNumber = await getCurrentRound(redis, gameId);
    }
    const cards = await redis.lrange(`${gameId}-r${roundNumber}-p${playerId}-cards`, 0, -1);
    return cards.map(card => {
        const [suit, value] = card.split('-') as [Suit, string];
        return {
            suit,
            number: value === 'null'
                ? null
                : Number.parseInt(value, 10)
        };
    });
};


const setPlayerCards = async (redis: Redis, gameId: string, playerId: string, roundNumber: number, cards: Card[]) => {
    await redis.del(`${gameId}-r${roundNumber}-p${playerId}-cards`);
    if (cards.length) {
        return redis.rpush(
            `${gameId}-r${roundNumber}-p${playerId}-cards`,
            ...cards.map(c => `${c.suit}-${c.number}`)
        );
    }
};


const getCurrentRound = async (redis: Redis, gameId: string) => {
    const roundNumber = await redis.get(`${gameId}-current-round`);
    // redis is dumb and stores this as a string
    return Number.parseInt(roundNumber, 10);
};


const setCurrentRound = async (redis: Redis, gameId: string, roundNumber: number) => {
    return redis.set(
        `${gameId}-current-round`,
        typeof roundNumber === 'string'
            ? Number.parseInt(roundNumber, 10)
            : roundNumber
    );
};

/**
 * shuffles the deck, assigns cards to players and assigns the trump for the current round
 * @param gameId
 *
 * @todo let the player decide trump when wizard comes up
 */
const startRound = async (redis: Redis, gameId: string) => {
    const [players, roundNumber] = await Promise.all([
        getPlayers(redis, gameId),
        getCurrentRound(redis, gameId),
    ]);

    let deck = shuffleYourDeck(createDeck());
    const cards: Record<string, Card[]> = {}

    for (const playerId of players) {
        cards[playerId] = deck.splice(0, roundNumber + 1);
    }

    const promises = [];

    let trumpSuit: Suit = deck.pop()?.suit ?? 'jester';

    if (trumpSuit === 'wizard') {
        // TODO: let the player decide, currently pick random
        trumpSuit = ['diamonds', 'spades', 'hearts', 'clubs'][Math.floor(Math.random() * 4)] as Suit;
    }

    promises.push(setTrumpSuit(redis, gameId, roundNumber, trumpSuit));

    for (const playerId of Object.keys(cards)) {
        promises.push(setPlayerCards(redis, gameId, playerId, roundNumber, cards[playerId]));
    }
    // default bets to -1
    promises.push(initializeArrayField(redis, `${gameId}-r${roundNumber}-bets`, players.length));
    promises.push(initializeArrayField(redis, `${gameId}-r${roundNumber}-taken`, roundNumber + 1, ''));

    await Promise.all(promises);
    return {
        cards, trump: trumpSuit, roundNumber
    };
};


const getPlayerBets = async (redis: Redis, gameId: string, roundNumber: number) => {
    const bets = await redis.lrange(`${gameId}-r${roundNumber}-bets`, 0, -1);
    return bets.map(b => Number.parseInt(b, 10));
};


/**
 *
 * @param redis
 * @param gameId
 * @param playerId
 * @param roundNumber
 * @param bet
 *
 * @returns true if all players have made their bet
 */
const setPlayerBet = async (redis: Redis, gameId: string, playerId: string, roundNumber: number, bet: number) => {
    if (bet < 0) {
        throw new Error(`Invalid bet. Must be a number greater than or equal to 0`);
    }
    if (bet > roundNumber + 1) {
        throw new Error(`Invalid bet. Cannot be larger than the possible tricks (${roundNumber + 1})`)
    }
    const [allBets, playerIndex] = await Promise.all([
        getPlayerBets(redis, gameId, roundNumber),
        getPlayerIndex(redis, gameId, playerId),
    ]);

    if (allBets[playerIndex] >= 0) {
        throw new Error(`Cannot set bet (${bet}). Bet has already been set (${allBets[playerIndex]})`);
    }
    await redis.lset(`${gameId}-r${roundNumber}-bets`, playerIndex, bet);
    allBets[playerIndex] = bet;
    return allBets.every(b => b >= 0);
};


const setPlayerReady = async (redis: Redis, gameId: string, roundNumber: number, trickNumber: number, playerId: string) => {
    return redis.sadd(`${gameId}-r${roundNumber}-t${trickNumber}-ready`, playerId);
};


const getPlayersReady = async (redis: Redis, gameId: string, roundNumber: number, trickNumber: number) => {
    return redis.smembers(`${gameId}-r${roundNumber}-t${trickNumber}-ready`);
};



export {
    currentRoundIsComplete,
    currentTrickIsComplete,
    evaluateTrick,
    getCurrentRound,
    getCurrentTrick,
    getPlayerBets,
    getPlayerCards,
    getPlayersReady,
    getTrickCardsByPlayer,
    getTrickLeader,
    getTrickWinners,
    getTrumpSuit,
    playCard,
    setCurrentRound,
    setCurrentTrick,
    setPlayerBet,
    setPlayerReady,
    startRound,
    whosTurnIsIt,
};
