import ioClient from 'socket.io-client';
import getPort from 'get-port';
import { SERVER_EVENTS, USER_EVENTS } from '../../src/types';

import { server as createServer } from '../';
import * as db from '../db';

Error.stackTraceLimit = Infinity;


const SUITS = ['wizard', 'jester', 'hearts', 'spades', 'diamonds', 'clubs'];
const playerIds = ['blargh', 'monkeys', 'fishmonger'];

let port;
let clientSocket;
let server;
let redis;

const promisifyEventEmitter = (eventName, ...args) => {
    return new Promise((resolve) => {
        clientSocket.emit(eventName, ...args, resolve);
    });
};


const promisifyEventListener = (event) => {
    return new Promise((resolve) => {
        clientSocket.on(event, (resp) => {
            resolve(resp);
        });
    });
};


beforeAll(async () => {
    port = await getPort();
    clientSocket = ioClient.connect(`http://localhost:${port}`);
    server = await createServer({ port });
    redis = await db.connect();
});

afterAll(async () => {
    server.close();
    await clientSocket.close();
});

afterEach(() => {
    clientSocket.removeAllListeners();
});

describe('create-game', () => {
    test('callback', async () => {
        const gameId = await promisifyEventEmitter(USER_EVENTS.CREATE_GAME);
        expect(typeof gameId).toBe('string');
    });
});

describe('game events', () => {
    let gameId;

    beforeEach(async () => {
        gameId = await promisifyEventEmitter(USER_EVENTS.CREATE_GAME);
    });

    afterEach(async () => {
        await db.deleteGame(server.db, gameId);
    });

    describe(USER_EVENTS.JOIN_GAME, () => {

        test('callback', async () => {
            const playerId = await promisifyEventEmitter(USER_EVENTS.JOIN_GAME, gameId, 'blargh');
            expect(playerId).toBe('blargh');
        });

        test('users-changed', async () => {
            const listener = promisifyEventListener(SERVER_EVENTS.PLAYERS_CHANGED);
            clientSocket.emit(USER_EVENTS.JOIN_GAME, gameId, 'monkeys');
            const players = await listener;
            expect(players).toEqual(['monkeys']);
        });
    });

    describe('rejoin-game', () => {

        beforeEach(async () => {
            await promisifyEventEmitter(USER_EVENTS.JOIN_GAME, gameId, 'blargh');
        });

        test('callback', async () => {
            const gameState = await promisifyEventEmitter(USER_EVENTS.REJOIN_GAME, gameId, 'blargh');
            expect(gameState).toHaveProperty('activePlayer', 'blargh');
            expect(gameState).toHaveProperty('cards');
            expect(gameState).toHaveProperty('roundNumber');
            expect(gameState).toHaveProperty('trickNumber');
            expect(gameState).toHaveProperty('trickCards');
            expect(gameState).toHaveProperty('trickLeader');
            expect(gameState).toHaveProperty('trickWinner');
            expect(gameState).toHaveProperty('stage');
            expect(gameState).toHaveProperty('trumpSuit');
            expect(gameState).toHaveProperty('scores');
            expect(gameState).toHaveProperty('players', ['blargh']);
        });

        test('error (on non-existant player id)', (done) => {
            clientSocket.on(SERVER_EVENTS.ERROR, (msg) => {
                expect(msg).toContain('does not exist');
                done();
            });
            clientSocket.emit(USER_EVENTS.REJOIN_GAME, gameId, 'monkeys');
        });
    });

    describe('get-users', () => {

        beforeEach(async () => {
            await Promise.all(['blargh', 'monkeys', 'fishmonger'].map(name => promisifyEventEmitter(
                USER_EVENTS.JOIN_GAME, gameId, name
            )));
        });

        test('callback', async () => {
            const players = await promisifyEventEmitter(USER_EVENTS.GET_PLAYERS, gameId)
            expect(players).toHaveProperty('length', 3);
            expect(players).toEqual(playerIds);
        });
    });

    describe(USER_EVENTS.START_GAME, () => {
        beforeEach(async () => {
            await Promise.all(playerIds.map(playerId => promisifyEventEmitter(
                USER_EVENTS.JOIN_GAME, gameId, playerId
            )));
        });

        test('trump-changed', (done) => {
            clientSocket.on(SERVER_EVENTS.TRUMP_CHANGED, (suit) => {
                expect(SUITS).toContain(suit);
                done();
            });
            clientSocket.emit(USER_EVENTS.START_GAME, gameId);
        });

        test('round-started', async () => {
            const listener = promisifyEventListener(SERVER_EVENTS.ROUND_STARTED);
            clientSocket.emit(USER_EVENTS.START_GAME, gameId);
            const resp: any = await listener;
            expect(resp).toHaveProperty('cards');
            expect(resp).toHaveProperty('roundNumber');
            expect(resp).toHaveProperty('trump');
            expect(resp).toHaveProperty('trickLeader', playerIds[playerIds.length - 1]);
            const { cards, roundNumber, trump } = resp;
            cards.forEach((card) => {
                expect(card).toHaveProperty('number');
                expect(card).toHaveProperty('suit');
                expect(SUITS).toContain(card.suit);
            });
            expect(cards).toHaveProperty('length', 1);
            expect(roundNumber).toEqual(0);
            expect(SUITS).toContain(trump);

        });

        test('error on join after game start', async () => {
            const startListener = promisifyEventListener(SERVER_EVENTS.ROUND_STARTED);
            clientSocket.emit(USER_EVENTS.START_GAME, gameId);
            await startListener;
            const listener = promisifyEventListener(SERVER_EVENTS.ERROR);
            clientSocket.emit(USER_EVENTS.JOIN_GAME, gameId, 'skjhgjshgs');
            const resp: any = await listener;
        });

        test('error on start game after game started', async () => {
            const startListener = promisifyEventListener(SERVER_EVENTS.ROUND_STARTED);
            clientSocket.emit(USER_EVENTS.START_GAME, gameId);
            await startListener;
            const listener = promisifyEventListener(SERVER_EVENTS.ERROR);
            clientSocket.emit(USER_EVENTS.START_GAME, gameId);
            const resp: any = await listener;
        });
    });

    describe('trick-started', () => {
        beforeEach(async () => {
            await Promise.all(playerIds.map(playerId => promisifyEventEmitter(
                USER_EVENTS.JOIN_GAME, gameId, playerId
            )));
            await promisifyEventEmitter(USER_EVENTS.START_GAME, gameId);

            await promisifyEventEmitter(USER_EVENTS.PLACE_BET, gameId, playerIds[0], 1);
            await promisifyEventEmitter(USER_EVENTS.PLACE_BET, gameId, playerIds[1], 1);
        });

        test('gets trick-started when last bet is placed', async () => {
            clientSocket.on()
            await promisifyEventEmitter(USER_EVENTS.PLACE_BET, gameId, playerIds[2], 1);

        })
    })

    describe(USER_EVENTS.PLAY_CARD, () => {

        beforeEach(async () => {
            await Promise.all(playerIds.map(playerId => promisifyEventEmitter(
                USER_EVENTS.JOIN_GAME, gameId, playerId
            )));
            await promisifyEventEmitter(USER_EVENTS.START_GAME, gameId);

            await Promise.all(playerIds.map(playerId => promisifyEventEmitter(
                USER_EVENTS.PLACE_BET, gameId, playerId, 1
            )));
        });

        test('lead-changed', (done) => {
            clientSocket.on('lead-changed', (suit) => {
                expect(SUITS).toContain(suit);
                done();
            });
            clientSocket.emit(USER_EVENTS.PLAY_CARD, gameId, playerIds[playerIds.length - 1], { suit: 'clubs', number: 1 });
        });

        test('active-user-changed', (done) => {
            clientSocket.on(SERVER_EVENTS.ACTIVE_PLAYER_CHANGED, (playerId) => {
                expect(playerId).toBe(playerIds[0]);
                done();
            });
            clientSocket.emit(USER_EVENTS.PLAY_CARD, gameId, playerIds[playerIds.length - 1], { suit: 'clubs', number: 1 });
        });

        test('card-played', (done) => {
            clientSocket.on(SERVER_EVENTS.CARD_PLAYED, (resp) => {
                expect(resp).toEqual({ card: { suit: 'clubs', number: 1 }, playerId: playerIds[playerIds.length - 1] })
                done();
            });
            clientSocket.emit(USER_EVENTS.PLAY_CARD, gameId, playerIds[playerIds.length - 1], { suit: 'clubs', number: 1 });
        });

        test('card-played (error)', (done) => {
            clientSocket.on(SERVER_EVENTS.ERROR, (msg) => {
                expect(msg).toContain('Invalid play: It is not this users (blargh) turn. Waiting for another player (fishmonger) to complete their turn')
                done();
            });
            clientSocket.emit(USER_EVENTS.PLAY_CARD, gameId, playerIds[0], { suit: 'clubs', number: 1 });
        });

        describe(SERVER_EVENTS.TRICK_WON, () => {
            beforeEach(async () => {
                await promisifyEventEmitter(
                    USER_EVENTS.PLAY_CARD,
                    gameId,
                    playerIds[2],
                    { suit: 'clubs', number: 5 }
                );
                await promisifyEventEmitter(
                    USER_EVENTS.PLAY_CARD,
                    gameId,
                    playerIds[0],
                    { suit: 'clubs', number: 6 }
                );
            });

            test('high number wins', (done) => {
                clientSocket.on(SERVER_EVENTS.TRICK_WON, ({ playerId }) => {
                    expect(playerId).toEqual(playerIds[1]);
                    done();
                });
                clientSocket.emit(USER_EVENTS.PLAY_CARD, gameId, playerIds[1], { suit: 'clubs', number: 7 });
            });

            test('low number loses', (done) => {
                clientSocket.on(SERVER_EVENTS.TRICK_WON, ({ playerId }) => {
                    expect(playerId).not.toEqual(playerIds[1]);
                    done();
                });
                clientSocket.emit(USER_EVENTS.PLAY_CARD, gameId, playerIds[1], { suit: 'clubs', number: 2 });
            });

            test('wizard wins', (done) => {
                clientSocket.on(SERVER_EVENTS.TRICK_WON, ({ playerId }) => {
                    expect(playerId).toEqual(playerIds[1]);
                    done();
                });
                clientSocket.emit(USER_EVENTS.PLAY_CARD, gameId, playerIds[1], { suit: 'wizard', number: null });
            });

            test('jester loses', (done) => {
                clientSocket.on(SERVER_EVENTS.TRICK_WON, ({ playerId }) => {
                    expect(playerId).not.toEqual(playerIds[1]);
                    done();
                });
                clientSocket.emit(USER_EVENTS.PLAY_CARD, gameId, playerIds[1], { suit: 'jester', number: null });
            });

            test('aces are high', (done) => {
                clientSocket.on(SERVER_EVENTS.TRICK_WON, ({ playerId }) => {
                    expect(playerId).toEqual(playerIds[1]);
                    done();
                });
                clientSocket.emit(USER_EVENTS.PLAY_CARD, gameId, playerIds[1], { suit: 'clubs', number: 1 });
            });
        });
    });

    describe(USER_EVENTS.PLACE_BET, () => {

        beforeEach(async () => {
            await Promise.all(['blargh', 'monkeys', 'fishmonger'].map(name => promisifyEventEmitter(
                USER_EVENTS.JOIN_GAME, gameId, name
            )));
            await promisifyEventEmitter(USER_EVENTS.START_GAME, gameId);
        });

        test('bet-placed (error too low)', (done) => {
            clientSocket.on(SERVER_EVENTS.ERROR, () => {
                done();
            });
            clientSocket.emit(USER_EVENTS.PLACE_BET, gameId, playerIds[0], -1);
        });

        test('bet-placed (error too high)', (done) => {
            clientSocket.on(SERVER_EVENTS.ERROR, () => {
                done();
            });
            clientSocket.emit(USER_EVENTS.PLACE_BET, gameId, playerIds[0], 2);
        });

        test(SERVER_EVENTS.BET_PLACED, (done) => {
            clientSocket.on(SERVER_EVENTS.BET_PLACED, (resp) => {
                expect(resp).toEqual({ playerId: playerIds[0], bet: 1 });
                done();
            });
            clientSocket.emit(USER_EVENTS.PLACE_BET, gameId, playerIds[0], 1);
        });
    });

    describe('players-ready', () => {
        beforeEach(async () => {
            await Promise.all(playerIds.map(playerId => promisifyEventEmitter(
                USER_EVENTS.JOIN_GAME, gameId, playerId
            )));
            await promisifyEventEmitter(USER_EVENTS.START_GAME, gameId);

            await Promise.all(playerIds.map(playerId => promisifyEventEmitter(
                USER_EVENTS.PLACE_BET, gameId, playerId, 1
            )));

            for (const playerIndex of [2, 0, 1]) {
                const playerId = playerIds[playerIndex];
                const cards = await db.getPlayerCards(redis, gameId, playerId, 0);
                await promisifyEventEmitter(USER_EVENTS.PLAY_CARD, gameId, playerId, cards[0]);
            }
        });

        test('player-ready', async () => {
            const listener = promisifyEventListener(SERVER_EVENTS.PLAYER_READY);
            clientSocket.emit(
                USER_EVENTS.READY_FOR_NEXT_TRICK,
                gameId, playerIds[0],
            );
            const resp: any = await listener;
            expect(resp).toEqual(playerIds[0]);
        });

        test(SERVER_EVENTS.ROUND_STARTED, async () => {
            const listener = promisifyEventListener(SERVER_EVENTS.ROUND_STARTED);
            await Promise.all(playerIds.map(async playerId => promisifyEventEmitter(USER_EVENTS.READY_FOR_NEXT_TRICK, gameId, playerId)));
            const resp: any = await listener;
            expect(resp).toHaveProperty('cards');
        });
    });
});
