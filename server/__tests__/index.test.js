const io = require('socket.io-client');
const getPort = require('get-port');

const { server: createServer } = require('../');
const db = require('../db');

Error.stackTraceLimit = Infinity;


const SUITS = ['wizard', 'jester', 'hearts', 'spades', 'diamonds', 'clubs'];

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
            expect(playerId).toBe(0);
        });

        test('users-changed', (done) => {
            clientSocket.on('users-changed', (players) => {
                expect(players.length).toBeGreaterThanOrEqual(1);
                expect(players[0]).toHaveProperty('playerId', 0);
                done();
            });
            clientSocket.emit('join-game', gameId, 'monkeys');
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
            expect(players).toEqual([
                { playerId: 0, name: 'blargh' },
                { playerId: 1, name: 'monkeys' },
                { playerId: 2, name: 'fishmonger' },
            ]);
        });
    });

    describe('start-game', () => {
        beforeEach(async () => {
            await Promise.all(['blargh', 'monkeys', 'fishmonger'].map(name => promisifyEventEmitter(
                'join-game', gameId, name
            )));
        });

        test('trump-changed', (done) => {
            clientSocket.on('trump-changed', (suit) => {
                expect(SUITS).toContain(suit);
                done();
            });
            clientSocket.emit('start-game', gameId);
        });

        test('active-user-changed', (done) => {
            clientSocket.on('active-user-changed', (playerId) => {
                expect(playerId).toBeLessThanOrEqual(2);
                expect(playerId).toBeGreaterThanOrEqual(0);
                done();
            });
            clientSocket.emit('start-game', gameId);
        });

        test('round-started', (done) => {
            clientSocket.on('round-started', (resp) => {
                expect(resp).toHaveProperty('cards');
                expect(resp).toHaveProperty('round');
                expect(resp).toHaveProperty('trump');
                const { cards, round, trump } = resp;
                cards.forEach((card) => {
                    expect(card).toHaveProperty('number');
                    expect(card).toHaveProperty('suit');
                    expect(SUITS).toContain(card.suit);
                });
                expect(cards).toHaveProperty('length', 1);
                expect(round).toBe('0');
                expect(SUITS).toContain(trump);
                done();
            });
            clientSocket.emit('start-game', gameId);
        });
    });

    describe('play-card', () => {
        let players;

        beforeEach(async () => {
            players = await Promise.all(['blargh', 'monkeys', 'fishmonger'].map(name => promisifyEventEmitter(
                'join-game', gameId, name
            )));
            await promisifyEventEmitter('start-game', gameId);

            await Promise.all([0, 1, 2].map(playerId => promisifyEventEmitter(
                'place-bet', gameId, playerId, 1
            )));
        });

        test('lead-changed', (done) => {
            clientSocket.on('lead-changed', (suit) => {
                expect(SUITS).toContain(suit);
                done();
            });
            clientSocket.emit('play-card', gameId, players[players.length - 1], { suit: 'clubs', number: 1 });
        });

        test('active-user-changed', (done) => {
            clientSocket.on('active-user-changed', (playerId) => {
                expect(playerId).toBe(0);
                done();
            });
            clientSocket.emit('play-card', gameId, players[players.length - 1], { suit: 'clubs', number: 1 });
        });

        test('card-played', (done) => {
            clientSocket.on('card-played', (resp) => {
                expect(resp).toEqual({ card: { suit: 'clubs', number: 1 }, playerId: players[players.length - 1] })
                done();
            });
            clientSocket.emit('play-card', gameId, players[players.length - 1], { suit: 'clubs', number: 1 });
        });

        test('card-played (error)', (done) => {
            clientSocket.on('error', (msg) => {
                expect(msg).toContain('Invalid play: It is not this users (0) turn. Waiting for player 2 to complete their turn')
                done();
            });
            clientSocket.emit('play-card', gameId, players[0], { suit: 'clubs', number: 1 });
        });

        describe('trick-won', () => {
            beforeEach(async () => {
                await promisifyEventEmitter(
                    'play-card',
                    gameId,
                    2,
                    { suit: 'clubs', number: 5 }
                );
                await promisifyEventEmitter(
                    'play-card',
                    gameId,
                    0,
                    { suit: 'clubs', number: 6 }
                );
            });

            test('high number wins', (done) => {
                clientSocket.on('trick-won', ({ playerId }) => {
                    expect(playerId).toBe(1);
                    done();
                });
                clientSocket.emit('play-card', gameId, 1, { suit: 'clubs', number: 7 });
            });

            test('low number loses', (done) => {
                clientSocket.on('trick-won', ({ playerId }) => {
                    expect(playerId).not.toBe(1);
                    done();
                });
                clientSocket.emit('play-card', gameId, 1, { suit: 'clubs', number: 2 });
            });

            test('wizard wins', (done) => {
                clientSocket.on('trick-won', ({ playerId }) => {
                    expect(playerId).toBe(1);
                    done();
                });
                clientSocket.emit('play-card', gameId, 1, { suit: 'wizard', number: null });
            });

            test('jester loses', (done) => {
                clientSocket.on('trick-won', ({ playerId }) => {
                    expect(playerId).not.toBe(1);
                    done();
                });
                clientSocket.emit('play-card', gameId, 1, { suit: 'jester', number: null });
            });

            test('aces are high', (done) => {
                clientSocket.on('trick-won', ({ playerId }) => {
                    expect(playerId).toBe(1);
                    done();
                });
                clientSocket.emit('play-card', gameId, 1, { suit: 'clubs', number: 1 });
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
            clientSocket.emit('place-bet', gameId, 0, -1);
        });

        test('bet-placed (error too high)', (done) => {
            clientSocket.on('error', () => {
                done();
            });
            clientSocket.emit('place-bet', gameId, 0, 2);
        });

        test('bet-placed', (done) => {
            clientSocket.on('bet-placed', (resp) => {
                expect(resp).toEqual({ playerId: 0, bet: 1 });
                done();
            });
            clientSocket.emit('place-bet', gameId, 0, 1);
        });
    });
});
