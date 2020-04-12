var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const db = require('./db');

const server = async ({ port = 3000 }) => {
    db.connect();
    await http.listen(port);
    console.log(`listening on localhost:${port}`);
    // WARNING: app.listen(80) will NOT work here!

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/tester.html');
    });


    io.on('connection', function (socket) {
        // client events
        socket.on('join-game', async (gameId, username) => {
            socket.join(gameId);
            const playerId = await db.addPlayerToGame(gameId, username);
            const [, players] = await Promise.all([
                db.setPlayerSocket(playerId, socket.id),
                await db.getGamePlayers(gameId),
            ]);
            io.to(socket.id).emit('user-joined', playerId);
            io.to(gameId).emit('users-changed', players.map((name, index) => ({ name, playerId: index })));
            // TODO: check if this is the last possible user?
        });

        socket.on('play-card', async (gameId, playerId, cardSuit, cardValue) => {
            const { trickComplete, trickWinner, roundComplete } = await db.playCard(
                gameId, playerId, cardSuit, cardValue
            );
            // end of round? or start next trick
            io.to(gameId).emit('card-played', { suit: cardSuit, value: cardValue, playerId });
            if (trickComplete) {
                io.to(gameId).emit('trick-won', { playerId: trickWinner });

                if (roundComplete) {
                    // re-deal cards
                    const { cards, trump } = await db.startRound(gameId);
                    const activeUser = await db.whosTurnIsIt(gameId);

                    io.to(gameId).emit('trump-changed', trump);
                    io.to(gameId).emit('active-user-changed', activeUser);

                    await Promise.all(Object.keys(cards).map(async playerId => {
                        const socketId = await db.getPlayerSocket(gameId, playerId);
                        io.to(socketId).emit(
                            'cards-dealt',
                            cards[playerId]
                        );
                    }));
                }
            }
        });

        socket.on('start-game', async (gameId) => {
            // deal the cards
            const { cards, trump } = await db.startGame(gameId);
            const activeUser = await db.whosTurnIsIt(gameId);
            // send a private message to each player with their cards
            io.to(gameId).emit('trump-changed', trump);
            io.to(gameId).emit('active-user-changed', activeUser);

            await Promise.all(Object.keys(cards).map(async playerId => {
                const socketId = await db.getPlayerSocket(gameId, playerId);
                io.to(socketId).emit(
                    'cards-dealt',
                    cards[playerId]
                );
            }));
        });

        socket.on('create-game', async () => {
            const gameId = await db.createGame();
            return io.to(socket.id).emit('new-game', gameId);
        });

    });
    return http;
};

module.exports = {
    server,
    close: () => {
        http.close();
        db.close();
    }
};
