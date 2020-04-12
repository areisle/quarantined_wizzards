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

test('create a new game', (done) => {
    clientSocket.on('new-game', (gameId) => {
        expect(typeof gameId).toBe('string');
        done();
    });
    clientSocket.emit('create-game');
});

afterAll(async () => {
    closeServer();
    await clientSocket.close();
});
