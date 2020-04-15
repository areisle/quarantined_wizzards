import { Redis } from 'ioredis';
const shortid = require('shortid');

const MAX_PLAYERS = 6;


const getPlayers = async (redis: Redis, gameId: string) => {
    return redis.lrange(`${gameId}-players`, 0, -1);
};


const getPlayerIndex = async (redis: Redis, gameId: string, playerId: string) => {
    const players = await getPlayers(redis, gameId);
    return players.indexOf(playerId);
};

const getPlayerId = async (redis: Redis, gameId: string, playerIndex: number) => {
    const players = await getPlayers(redis, gameId);
    return players[playerIndex];
};

const playerExists = async (redis: Redis, gameId: string, playerId: string) => {
    const players = await getPlayers(redis, gameId);
    if (!players.includes(playerId)) {
        throw new Error(`Invalid player. Player (${playerId}) does not exist`);
    }
}


const addPlayer = async (redis: Redis, gameId: string, username: string) => {
    let players = await getPlayers(redis, gameId);

    if (players.includes(username)) {
        throw new Error(`cannot add username. This username already exists`);
    }

    if (players.length === MAX_PLAYERS) {
        throw new Error(`Game is already full`);
    }
    await redis.rpush(`${gameId}-players`, username);
    players = await getPlayers(redis, gameId);
    return players.indexOf(username);
};


const createGame = async (redis: Redis) => {
    const gameId = shortid.generate();
    await redis.sadd('games', gameId);
    return gameId;
};

const deleteGame = async (redis: Redis, gameId: string) => {
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

const setGameStarted = async (redis: Redis, gameId: string) => {
    await redis.set(`${gameId}-started`, 'true');
    return true;
};

const getGameStarted = async (redis: Redis, gameId: string) => {
    const started = await redis.get(`${gameId}-started`);
    return Boolean(started && started.toString() === 'true');
};


export {
    addPlayer,
    createGame,
    deleteGame,
    getGameStarted,
    getPlayerId,
    getPlayerIndex,
    getPlayers,
    playerExists,
    setGameStarted,
};
