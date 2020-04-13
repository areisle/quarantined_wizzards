const shortid = require('shortid');

const MAX_PLAYERS = 6;


const getPlayers = async (redis, gameId) => {
    return redis.lrange(`${gameId}-players`, 0, -1);
};


const addPlayer = async (redis, gameId, username) => {
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


const createGame = async (redis) => {
    const gameId = shortid.generate();
    await redis.sadd(['games', gameId]);
    return gameId;
};

const deleteGame = async (redis, gameId) => {
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


module.exports = { getPlayers, createGame, deleteGame, addPlayer };
