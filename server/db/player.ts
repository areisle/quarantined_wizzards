import { Redis } from 'ioredis';

const setPlayerSocket = async (redis: Redis, gameId: string, playerId: string, socketId: string) => redis.set(`${gameId}-p${playerId}-socket`, socketId);

const getPlayerSocket = async (redis: Redis, gameId: string, playerId: string) => redis.get(`${gameId}-p${playerId}-socket`);

export {
    getPlayerSocket,
    setPlayerSocket,
};
