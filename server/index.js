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
        /**
         * @param {function} callbackFn callback which is passed the newly created gameId
         */
        socket.on('create-game', async (callbackFn) => {
            const gameId = await db.createGame();
            callbackFn && callbackFn(gameId);
        });

        /**
         * @param {string} gameId the game id
         * @param {string} username the name user joining the game
         * @param {function} callbackFn callback which is passed the newly created playerId
         */
        socket.on('join-game', async (gameId, username, callbackFn) => {
            socket.join(gameId);
            const playerId = await db.addPlayerToGame(gameId, username);
            const [, players] = await Promise.all([
                db.setPlayerSocket(gameId, playerId, socket.id),
                db.getGamePlayers(gameId),
            ]);
            callbackFn && callbackFn(playerId);
            io.to(gameId).emit('users-changed', players.map((name, index) => ({ name, playerId: index })));
            // TODO: check if this is the last possible user?
        });

        /**
         * @param {string} gameId the game id
         */
        socket.on('start-game', async (gameId, callbackFn) => {
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
            callbackFn && callbackFn();
        });

        /**
         * @param {string} gameId the game id
         * @param {Number} playerId the id of the player playing the card
         * @param {string} cardSuit the suit of the card being played
         * @param {Number} cardValue the number of the card being played
         */
        socket.on('play-card', async (gameId, playerId, cardSuit, cardValue, callbackFn) => {
            const { trickComplete, trickWinner, roundComplete, newLeadSuit } = await db.playCard(
                gameId, playerId, cardSuit, cardValue
            );
            // end of round? or start next trick
            io.to(gameId).emit('card-played', { card: { suit: cardSuit, number: cardValue }, playerId });

            if (newLeadSuit) {
                io.to(gameId).emit('lead-changed', newLeadSuit);
            }
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
            callbackFn && callbackFn();
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
