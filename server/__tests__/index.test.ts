import io from 'socket.io';
import getPort from 'get-port';

import { server as createServer } from '../';
import * as db from '../db';

Error.stackTraceLimit = Infinity;


const SUITS = ['wizard', 'jester', 'hearts', 'spades', 'diamonds', 'clubs'];
const playerIds = ['blargh', 'monkeys', 'fishmonger'];

let port,
    clientSocket,
    server;

const promisifyEventEmitter = (eventName, ...args) => {
    return new Promise((resolve) => {
        clientSocket.emit(eventName, ...args, resolve);
    });
};


beforeAll(async () => {
    port = await getPort();
    clientSocket = await io(`http://localhost:${port}`);
    server = await createServer({ port });
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
        const gameId = await promisifyEventEmitter('create-game');
        expect(typeof gameId).toBe('string');
    });
});

describe('game events', () => {
    let gameId;

    beforeEach(async () => {
        gameId = await promisifyEventEmitter('create-game');
    });

    afterEach(async () => {
        await db.deleteGame(server.db, gameId);
    });

    describe('join-game', () => {

        test('callback', async () => {
            const playerId = await promisifyEventEmitter('join-game', gameId, 'blargh');
            expect(playerId).toBe('blargh');
        });

        test('users-changed', (done) => {
            clientSocket.on('users-changed', (players) => {
                expect(players).toEqual(['monkeys']);
                done();
            });
            clientSocket.emit('join-game', gameId, 'monkeys');
        });
    });

    describe('rejoin-game', () => {

        beforeEach(async () => {
            await promisifyEventEmitter('join-game', gameId, 'blargh');
        });

        test('callback', async () => {
            const gameState = await promisifyEventEmitter('rejoin-game', gameId, 'blargh');
            expect(gameState).toHaveProperty('activePlayer', 'blargh');
            expect(gameState).toHaveProperty('cards');
            expect(gameState).toHaveProperty('roundNumber');
            expect(gameState).toHaveProperty('trickNumber');
            expect(gameState).toHaveProperty('trickCards');
            expect(gameState).toHaveProperty('trickLeader');
            expect(gameState).toHaveProperty('scores');
            expect(gameState).toHaveProperty('gameStarted', false);
            expect(gameState).toHaveProperty('players', ['blargh']);
        });

        test('error (on non-existant player id)', (done) => {
            clientSocket.on('error', (msg) => {
                expect(msg).toContain('does not exist');
                done();
            });
            clientSocket.emit('rejoin-game', gameId, 'monkeys');
        });
    });

    describe('get-users', () => {

        beforeEach(async () => {
            await Promise.all(['blargh', 'monkeys', 'fishmonger'].map(name => promisifyEventEmitter(
                'join-game', gameId, name
            )));
        });

        test('callback', async () => {
            const players = await promisifyEventEmitter('get-users', gameId)
            expect(players).toHaveProperty('length', 3);
            expect(players).toEqual(playerIds);
        });
    });

    describe('start-game', () => {
        beforeEach(async () => {
            await Promise.all(playerIds.map(playerId => promisifyEventEmitter(
                'join-game', gameId, playerId
            )));
        });

        test('trump-changed', (done) => {
            clientSocket.on('trump-changed', (suit) => {
                expect(SUITS).toContain(suit);
                done();
            });
            clientSocket.emit('start-game', gameId);
        });

        test('round-started', (done) => {
            clientSocket.on('round-started', (resp) => {
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
                done();
            });
            clientSocket.emit('start-game', gameId);
        });
    });

    describe('trick-started', () => {
        beforeEach(async () => {
            await Promise.all(playerIds.map(playerId => promisifyEventEmitter(
                'join-game', gameId, playerId
            )));
            await promisifyEventEmitter('start-game', gameId);

            await promisifyEventEmitter('place-bet', gameId, playerIds[0], 1);
            await promisifyEventEmitter('place-bet', gameId, playerIds[1], 1);
        });

        test('gets trick-started when last bet is placed', async () => {
            clientSocket.on()
            await promisifyEventEmitter('place-bet', gameId, playerIds[2], 1);

        })
    })

    describe('play-card', () => {

        beforeEach(async () => {
            await Promise.all(playerIds.map(playerId => promisifyEventEmitter(
                'join-game', gameId, playerId
            )));
            await promisifyEventEmitter('start-game', gameId);

            await Promise.all(playerIds.map(playerId => promisifyEventEmitter(
                'place-bet', gameId, playerId, 1
            )));
        });

        test('lead-changed', (done) => {
            clientSocket.on('lead-changed', (suit) => {
                expect(SUITS).toContain(suit);
                done();
            });
            clientSocket.emit('play-card', gameId, playerIds[playerIds.length - 1], { suit: 'clubs', number: 1 });
        });

        test('active-user-changed', (done) => {
            clientSocket.on('active-user-changed', (playerId) => {
                expect(playerId).toBe(playerIds[0]);
                done();
            });
            clientSocket.emit('play-card', gameId, playerIds[playerIds.length - 1], { suit: 'clubs', number: 1 });
        });

        test('card-played', (done) => {
            clientSocket.on('card-played', (resp) => {
                expect(resp).toEqual({ card: { suit: 'clubs', number: 1 }, playerId: playerIds[playerIds.length - 1] })
                done();
            });
            clientSocket.emit('play-card', gameId, playerIds[playerIds.length - 1], { suit: 'clubs', number: 1 });
        });

        test('card-played (error)', (done) => {
            clientSocket.on('error', (msg) => {
                expect(msg).toContain('Invalid play: It is not this users (blargh) turn. Waiting for another player (fishmonger) to complete their turn')
                done();
            });
            clientSocket.emit('play-card', gameId, playerIds[0], { suit: 'clubs', number: 1 });
        });

        describe('trick-won', () => {
            beforeEach(async () => {
                await promisifyEventEmitter(
                    'play-card',
                    gameId,
                    playerIds[2],
                    { suit: 'clubs', number: 5 }
                );
                await promisifyEventEmitter(
                    'play-card',
                    gameId,
                    playerIds[0],
                    { suit: 'clubs', number: 6 }
                );
            });

            test('high number wins', (done) => {
                clientSocket.on('trick-won', ({ playerId }) => {
                    expect(playerId).toEqual(playerIds[1]);
                    done();
                });
                clientSocket.emit('play-card', gameId, playerIds[1], { suit: 'clubs', number: 7 });
            });

            test('low number loses', (done) => {
                clientSocket.on('trick-won', ({ playerId }) => {
                    expect(playerId).not.toEqual(playerIds[1]);
                    done();
                });
                clientSocket.emit('play-card', gameId, playerIds[1], { suit: 'clubs', number: 2 });
            });

            test('wizard wins', (done) => {
                clientSocket.on('trick-won', ({ playerId }) => {
                    expect(playerId).toEqual(playerIds[1]);
                    done();
                });
                clientSocket.emit('play-card', gameId, playerIds[1], { suit: 'wizard', number: null });
            });

            test('jester loses', (done) => {
                clientSocket.on('trick-won', ({ playerId }) => {
                    expect(playerId).not.toEqual(playerIds[1]);
                    done();
                });
                clientSocket.emit('play-card', gameId, playerIds[1], { suit: 'jester', number: null });
            });

            test('aces are high', (done) => {
                clientSocket.on('trick-won', ({ playerId }) => {
                    expect(playerId).toEqual(playerIds[1]);
                    done();
                });
                clientSocket.emit('play-card', gameId, playerIds[1], { suit: 'clubs', number: 1 });
            });
        });
    });

    describe('place-bet', () => {

        beforeEach(async () => {
            await Promise.all(['blargh', 'monkeys', 'fishmonger'].map(name => promisifyEventEmitter(
                'join-game', gameId, name
            )));
            await promisifyEventEmitter('start-game', gameId);
        });

        test('bet-placed (error too low)', (done) => {
            clientSocket.on('error', () => {
                done();
            });
            clientSocket.emit('place-bet', gameId, playerIds[0], -1);
        });

        test('bet-placed (error too high)', (done) => {
            clientSocket.on('error', () => {
                done();
            });
            clientSocket.emit('place-bet', gameId, playerIds[0], 2);
        });

        test('bet-placed', (done) => {
            clientSocket.on('bet-placed', (resp) => {
                expect(resp).toEqual({ playerId: playerIds[0], bet: 1 });
                done();
            });
            clientSocket.emit('place-bet', gameId, playerIds[0], 1);
        });
    });
});
