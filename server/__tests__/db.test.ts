import ioClient from 'socket.io-client';
import getPort from 'get-port';
import { SERVER_EVENTS, USER_EVENTS, SUIT } from '../../src/types';

import { server as createServer } from '../';
import * as db from '../db';

const shortid = require('shortid');


let redis;
let gameId;
const playerId = 'blargh';

beforeAll(async () => {
    redis = await db.connect();
});

afterAll(async () => {
    await redis.quit();
});

beforeEach(() => {
    gameId = shortid.generate();
});

afterEach(async () => {
    await db.deleteGame(redis, gameId);
});


describe('setPlayerCards sorts cards on set', () => {
    test('ace before king of same suit', async () => {
        await db.setPlayerCards(redis, gameId, playerId, 0, [
            { suit: SUIT.CLUBS, number: 13 },
            { suit: SUIT.CLUBS, number: 1 },
        ]);
        const result = await db.getPlayerCards(redis, gameId, playerId, 0);
        expect(result).toEqual([
            { suit: SUIT.CLUBS, number: 1 },
            { suit: SUIT.CLUBS, number: 13 },
        ]);
    });
    test('wizards leftmost', async () => {
        await db.setPlayerCards(redis, gameId, playerId, 0, [
            { suit: SUIT.JESTER, number: null },
            { suit: SUIT.CLUBS, number: 1 },
            { suit: SUIT.HEARTS, number: 1 },
            { suit: SUIT.SPADES, number: 1 },
            { suit: SUIT.WIZARD, number: null },
            { suit: SUIT.DIAMONDS, number: 1 },
        ]);
        const result = await db.getPlayerCards(redis, gameId, playerId, 0);
        expect(result[0]).toEqual({ suit: SUIT.WIZARD, number: null });
    });
    test('jesters after wizards', async () => {
        await db.setPlayerCards(redis, gameId, playerId, 0, [
            { suit: SUIT.JESTER, number: null },
            { suit: SUIT.CLUBS, number: 1 },
            { suit: SUIT.HEARTS, number: 1 },
            { suit: SUIT.SPADES, number: 1 },
            { suit: SUIT.WIZARD, number: null },
            { suit: SUIT.DIAMONDS, number: 1 },
        ]);
        const result = await db.getPlayerCards(redis, gameId, playerId, 0);
        expect(result[1]).toEqual({ suit: SUIT.JESTER, number: null });
    });
    test('order suits independant of values', async () => {
        await db.setPlayerCards(redis, gameId, playerId, 0, [
            { suit: SUIT.CLUBS, number: 10 },
            { suit: SUIT.HEARTS, number: 1 },
            { suit: SUIT.SPADES, number: 2 },
            { suit: SUIT.DIAMONDS, number: 11 },
        ]);
        const result = await db.getPlayerCards(redis, gameId, playerId, 0);
        expect(result).toEqual([
            { suit: SUIT.SPADES, number: 2 },
            { suit: SUIT.HEARTS, number: 1 },
            { suit: SUIT.CLUBS, number: 10 },
            { suit: SUIT.DIAMONDS, number: 11 },
        ]);
    });
    test.todo('jesters after wizards');
});
