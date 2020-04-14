const setPlayerSocket = async (redis, gameId, playerId, socketId) => {
    return redis.set(`${gameId}-p${playerId}-socket`, socketId);
};


const getPlayerSocket = async (redis, gameId, playerId) => {
    return redis.get(`${gameId}-p${playerId}-socket`);
};


module.exports = {
    getPlayerSocket,
    setPlayerSocket,
};
