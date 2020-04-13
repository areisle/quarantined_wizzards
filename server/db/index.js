const Redis = require("ioredis");

const { createGame, deleteGame, getPlayers, addPlayer, getPlayerIndex, playerExists } = require('./game');
const { getPlayerSocket, setPlayerSocket } = require('./player');
const {
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
} = require('./round');

const TOTAL_CARDS = 60;
const MIN_PLAYERS = 3;



const connect = async () => {
    const redis = new Redis();
    try {
        await redis.connect();
    } catch (err) { }
    return redis;
};


const getGameState = async (redis, gameId) => {
    // {}[round] -> {}[playerId] -> {bet: number, taken: number}
    const [currentRound, currentTrick, players] = await Promise.all([
        getCurrentRound(redis, gameId),
        getCurrentTrick(redis, gameId),
        getPlayers(redis, gameId),
    ]);
    const rounds = [];
    for (let round = 0; round < currentRound + 1; round++) {
        rounds.push(round);
    }
    const allBets = await Promise.all(rounds.map(async round => getPlayerBets(redis, gameId, round)));
    const trickWinners = await Promise.all(rounds.map(async round => getTrickWinners(redis, gameId, round)));

    const scores = {};
    allBets.forEach((bets, round) => {
        scores[round] = {};
        players.forEach((playerId, playerIndex) => {
            scores[round][playerId] = { bet: bets[playerIndex], taken: 0 };
        });

        for (const trickWinner of trickWinners[round]) {
            scores[round][trickWinner].taken += 1;
        }
    });

    return {
        scores,
        trick: currentTrick,
        round: currentRound,
        players: players
    };
};


/**
 * This starts the game. At this point all the players are in. It will
 * initialize the score board for the number of players
 *
 * @param {string} gameId
 */
const startGame = async (redis, gameId) => {
    const players = await getPlayers(redis, gameId);
    if (players.length < MIN_PLAYERS) {
        throw new Error(`Too few players (${players.length}) in game (${gameId}). Waiting for another player to join`);
    }
    const rounds = TOTAL_CARDS / players.length;
    await Promise.all([
        setCurrentRound(redis, gameId, 0),
        setCurrentTrick(redis, gameId, 0)
    ]);

    // set the dealers and trick leaders for each round
    const setDealers = []
    for (let round = 0; round < rounds; round++) {
        const dealer = round % players.length;
        const trickLeader = dealer === 0
            ? players.length - 1
            : dealer - 1;
        setDealers.push(redis.set(`${gameId}-r${round}-dealer`, dealer));
        setDealers.push(redis.rpush(`${gameId}-r${round}-trickleaders`, players[trickLeader]));
    }
    await Promise.all(setDealers);
    return startRound(redis, gameId);
};


module.exports = {
    addPlayerToGame: addPlayer,
    close: (redis) => redis && redis.quit(),
    connect,
    createGame,
    deleteGame,
    evaluateTrick,
    getCurrentRound,
    getCurrentTrick,
    getGamePlayers: getPlayers,
    getPlayerIndex,
    getPlayerCards,
    getPlayerSocket,
    getTrickLeader,
    playCard,
    setCurrentRound,
    setCurrentTrick,
    setPlayerBet,
    setPlayerSocket,
    startGame,
    startRound,
    whosTurnIsIt,
    playerExists,
};
