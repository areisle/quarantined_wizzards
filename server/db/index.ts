import IORedis, { Redis } from 'ioredis';
import {
    addPlayer,
    createGame,
    deleteGame,
    getGameStarted,
    getPlayerIndex,
    getPlayers,
    playerExists,
    setGameStarted,
} from './game';
import { getPlayerSocket, setPlayerSocket } from './player';
import {
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
    playCard,
    setCurrentRound,
    setCurrentTrick,
    setPlayerBet,
    setPlayerReady,
    startRound,
    whosTurnIsIt,
    getTrumpSuit,
} from './round';
import { GameState, GAME_STAGE, Suit } from '../../src/types';

const TOTAL_CARDS = 60;
const MIN_PLAYERS = 3;


const connect = async () => {
    const redis = new IORedis(process.env.REDIS_URL);
    try {
        await redis.connect();
    } catch (err) { }
    return redis;
};


const getGameState = async (redis: Redis, gameId: string, playerId: string): Promise<Partial<GameState>> => {
    const [currentRound, currentTrick, players, gameStarted] = await Promise.all([
        getCurrentRound(redis, gameId),
        getCurrentTrick(redis, gameId),
        getPlayers(redis, gameId),
        getGameStarted(redis, gameId),
    ]);
    const rounds: number[] = [];
    for (let roundNumber = 0; roundNumber < currentRound + 1; roundNumber++) {
        rounds.push(roundNumber);
    }

    const [
        allBets,
        trickWinners,
        trickCards,
        trickLeader,
        activePlayer,
        cards,
        trumpSuit,
        readyPlayers,
    ] = await Promise.all([
        Promise.all(rounds.map(async roundNumber => getPlayerBets(redis, gameId, roundNumber))),
        Promise.all(rounds.map(async roundNumber => getTrickWinners(redis, gameId, roundNumber))),
        getTrickCardsByPlayer(redis, gameId, currentRound, currentTrick),
        getTrickLeader(redis, gameId, currentRound, currentTrick),
        whosTurnIsIt(redis, gameId),
        getPlayerCards(redis, gameId, playerId, currentRound),
        getTrumpSuit(redis, gameId, currentRound),
        getPlayersReady(redis, gameId, currentRound, currentTrick),
    ]);

    const scores: GameState['scores'] = [];
    allBets.forEach((bets, roundNumber: number) => {
        scores[roundNumber] = {};
        players.forEach((playerId, playerIndex) => {
            scores[roundNumber][playerId] = {
                bet: bets[playerIndex] >= 0
                    ? bets[playerIndex]
                    : null,
                taken: 0
            };
        });

        for (const trickWinner of trickWinners[roundNumber]) {
            if (trickWinner) {
                scores[roundNumber][trickWinner].taken += 1;
            }
        }
    });

    const ready: GameState['ready'] = {};
    players.forEach((playerId) => {
        ready[playerId] = readyPlayers.includes(playerId);
    })

    let stage = GAME_STAGE.SETTING_UP;

    if (gameStarted) {
        if (Object.keys(trickCards).length === players.length) {
            stage = GAME_STAGE.BETWEEN_TRICKS;
        } else if (Object.values(scores[currentRound]).every(b => b.bet !== null)) {
            stage = GAME_STAGE.PLAYING;
        } else {
            stage = GAME_STAGE.BETTING;
        }
    }

    return {
        activePlayer,
        cards,
        players: players,
        ready,
        roundNumber: currentRound,
        scores,
        stage,
        trickCards,
        trickLeader: trickLeader || null,
        trickNumber: currentTrick,
        trumpSuit: trumpSuit as Suit,
    };
};


/**
 * This starts the game. At this point all the players are in. It will
 * initialize the score board for the number of players
 */
const startGame = async (redis: Redis, gameId: string) => {
    const [players, gameIsStarted] = await Promise.all([
        getPlayers(redis, gameId),
        getGameStarted(redis, gameId),
    ]);

    if (gameIsStarted) {
        throw new Error(`cannot start a game that has already begun`);
    }
    if (players.length < MIN_PLAYERS) {
        throw new Error(`Too few players (${players.length}) in game (${gameId}). Waiting for another player to join`);
    }
    const rounds = TOTAL_CARDS / players.length;
    await Promise.all([
        setCurrentRound(redis, gameId, 0),
        setCurrentTrick(redis, gameId, 0),
        setGameStarted(redis, gameId),
    ]);

    // set the dealers and trick leaders for each round
    const setDealers = []
    for (let roundNumber = 0; roundNumber < rounds; roundNumber++) {
        const dealer = roundNumber % players.length;
        const trickLeader = dealer === 0
            ? players.length - 1
            : dealer - 1;
        setDealers.push(redis.set(`${gameId}-r${roundNumber}-dealer`, players[dealer]));
        setDealers.push(redis.rpush(`${gameId}-r${roundNumber}-trickleaders`, players[trickLeader]));
    }
    await Promise.all(setDealers);
    return startRound(redis, gameId);
};

const close = (redis: Redis) => redis?.quit();

export {
    addPlayer as addPlayerToGame,
    close,
    connect,
    createGame,
    currentRoundIsComplete,
    currentTrickIsComplete,
    deleteGame,
    evaluateTrick,
    getCurrentRound,
    getCurrentTrick,
    getGameState,
    getPlayerCards,
    getPlayerIndex,
    getPlayers as getGamePlayers,
    getPlayerSocket,
    getPlayersReady,
    getTrickLeader,
    playCard,
    playerExists,
    setCurrentRound,
    setCurrentTrick,
    setPlayerBet,
    setPlayerReady,
    setPlayerSocket,
    startGame,
    startRound,
    whosTurnIsIt,
};
