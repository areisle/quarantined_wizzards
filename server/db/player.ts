import { Redis } from 'ioredis';

const setPlayerSocket = async (redis: Redis, gameId: string, playerId: string, socketId: string) => {
    return redis.set(`${gameId}-p${playerId}-socket`, socketId);
};


const getPlayerSocket = async (redis: Redis, gameId: string, playerId: string) => {
    return redis.get(`${gameId}-p${playerId}-socket`);
};


export {
    getPlayerSocket,
    setPlayerSocket,
};
