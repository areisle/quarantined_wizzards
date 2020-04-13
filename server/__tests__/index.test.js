const io = require('socket.io-client');
const getPort = require('get-port');

const { server: createServer, close: closeServer } = require('../');

let port,
    clientSocket;


beforeAll(async () => {
    port = await getPort();
    clientSocket = await io(`http://localhost:${port}`);
    await createServer({ port });
});

test('create-game', (done) => {
    clientSocket.on('new-game', (gameId) => {
        expect(typeof gameId).toBe('string');
        done();
    });
    clientSocket.emit('create-game');
});

describe('join-game', () => {
    let gameId;

    beforeAll((done) => {
        clientSocket.on('new-game', (gameIdIn) => {
            gameId = gameIdIn;
            done();
        });
        clientSocket.emit('create-game');
    });

    test('client gets user-joined event', (done) => {
        clientSocket.on('user-joined', (playerId) => {
            done();
        });
        clientSocket.emit('join-game', gameId, 'blargh');
    });

    test('client gets users-changed event', (done) => {
        clientSocket.on('users-changed', (players) => {
            expect(players.length).toBeGreaterThanOrEqual(1);
            expect(players[0]).toHaveProperty('playerId', 0);
            done();
        });
        clientSocket.emit('join-game', gameId, 'monkeys');
    });
})

afterAll(async () => {
    closeServer();
    await clientSocket.close();
});
