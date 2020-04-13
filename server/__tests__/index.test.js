const io = require('socket.io-client');
const getPort = require('get-port');

const { server: createServer } = require('../');
const db = require('../db');

Error.stackTraceLimit = Infinity;


const SUITS = ['wizard', 'jester', 'hearts', 'spades', 'diamonds', 'clubs'];

let port,
    clientSocket,
    server;


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
})

describe('create-game', () => {
    test('callback', (done) => {
        clientSocket.emit('create-game', (gameId) => {
            expect(typeof gameId).toBe('string');
            done();
        });
    });
});


describe('join-game', () => {
    let gameId;

    beforeAll((done) => {
        clientSocket.emit('create-game', (gameIdIn) => {
            gameId = gameIdIn;
            done();
        });
    });

    test('callback', (done) => {
        clientSocket.emit('join-game', gameId, 'blargh', (playerId) => {
            expect([0, 1]).toContain(playerId);
            done();
        });
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

describe('start-game', () => {
    let gameId;

    beforeEach(async () => {
        gameId = await new Promise((resolve) => {
            clientSocket.emit('create-game', resolve);
        });
        await Promise.all(['blargh', 'monkeys', 'fishmonger'].map(name => {
            return new Promise((resolve) => {
                clientSocket.emit('join-game', gameId, name, resolve);
            });
        }));
    });

    afterEach(async () => {
        await db.deleteGame(server.db, gameId);
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
    let gameId,
        players;

    beforeEach(async () => {
        gameId = await new Promise((resolve) => {
            clientSocket.emit('create-game', resolve);
        });
        players = await Promise.all(['blargh', 'monkeys', 'fishmonger'].map(name => {
            return new Promise((resolve) => {
                clientSocket.emit('join-game', gameId, name, resolve);
            });
        }));
        await new Promise((resolve) => {
            clientSocket.emit('start-game', gameId, resolve);
        });

        await Promise.all([0, 1, 2].map(playerId => {
            return new Promise((resolve) => {
                clientSocket.emit('place-bet', gameId, playerId, 1, resolve);
            });
        }));
    });

    afterEach(async () => {
        await db.deleteGame(server.db, gameId);
    });

    test('lead-changed', (done) => {
        clientSocket.on('lead-changed', (suit) => {
            expect(SUITS).toContain(suit);
            done();
        });
        clientSocket.emit('play-card', gameId, players[players.length - 1], 'clubs', 1);
    });

    test('card-played', (done) => {
        clientSocket.on('card-played', (resp) => {
            expect(resp).toEqual({ card: { suit: 'clubs', number: 1 }, playerId: players[players.length - 1] })
            done();
        });
        clientSocket.emit('play-card', gameId, players[players.length - 1], 'clubs', 1);
    });

    test('card-played (error)', (done) => {
        clientSocket.on('error', (msg) => {
            expect(msg).toContain('Invalid play: It is not this users (0) turn. Waiting for player 2 to complete their turn')
            done();
        });
        clientSocket.emit('play-card', gameId, players[0], 'clubs', 1);
    });

    describe('trick-won', () => {
        beforeEach(async () => {
            await (new Promise(resolve => clientSocket.emit(
                'play-card',
                gameId,
                2,
                'clubs',
                5,
                resolve
            )));
            await (new Promise(resolve => clientSocket.emit(
                'play-card',
                gameId,
                0,
                'clubs',
                6,
                resolve
            )));
        });

        test('high number wins', (done) => {
            clientSocket.on('trick-won', ({ playerId }) => {
                expect(playerId).toBe(1);
                done();
            });
            clientSocket.emit('play-card', gameId, 1, 'clubs', 7);
        });

        test('low number loses', (done) => {
            clientSocket.on('trick-won', ({ playerId }) => {
                expect(playerId).not.toBe(1);
                done();
            });
            clientSocket.emit('play-card', gameId, 1, 'clubs', 1);
        });

        test('wizard wins', (done) => {
            clientSocket.on('trick-won', ({ playerId }) => {
                expect(playerId).toBe(1);
                done();
            });
            clientSocket.emit('play-card', gameId, 1, 'wizard', null);
        });

        test('jester loses', (done) => {
            clientSocket.on('trick-won', ({ playerId }) => {
                expect(playerId).not.toBe(1);
                done();
            });
            clientSocket.emit('play-card', gameId, 1, 'jester', null);
        });
    });
});



describe('place-bet', () => {
    let gameId;

    beforeEach(async () => {
        gameId = await new Promise((resolve) => {
            clientSocket.emit('create-game', resolve);
        });
        await Promise.all(['blargh', 'monkeys', 'fishmonger'].map(name => {
            return new Promise((resolve) => {
                clientSocket.emit('join-game', gameId, name, resolve);
            });
        }));
        await new Promise((resolve) => {
            clientSocket.emit('start-game', gameId, resolve);
        });
    });

    afterEach(async () => {
        await db.deleteGame(server.db, gameId);
    });

    test('bet-placed (error too low)', (done) => {
        clientSocket.on('error', (msg) => {
            done();
        });
        clientSocket.emit('place-bet', gameId, 0, -1);
    });

    test('bet-placed (error too high)', (done) => {
        clientSocket.on('error', (msg) => {
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
