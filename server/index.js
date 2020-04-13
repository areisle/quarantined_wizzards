var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const db = require('./db');

const server = async ({ port = 3000 }) => {
    const redis = await db.connect();
    await http.listen(port);
    console.log(`listening on localhost:${port}`);
    // WARNING: app.listen(80) will NOT work here!

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/tester.html');
    });

    const startRoundEvents = async (gameId, firstRound = false) => {
        // send a private message to each player with their cards
        const { cards, trump, round } = await (firstRound
            ? db.startGame(redis, gameId)
            : db.startRound(redis, gameId));
        const activeUser = await db.whosTurnIsIt(redis, gameId);

        io.to(gameId).emit('active-user-changed', activeUser);
        io.to(gameId).emit('trump-changed', trump);

        await Promise.all(Object.keys(cards).map(async playerId => {
            const socketId = await db.getPlayerSocket(redis, gameId, playerId);
            io.to(socketId).emit(
                'round-started',
                { cards: cards[playerId], round, trump }
            );
        }));
    };

    io.on('connection', function (socket) {
        /**
         * @param {function} callbackFn callback which is passed the newly created gameId
         */
        socket.on('create-game', async (callbackFn) => {
            const gameId = await db.createGame(redis);
            callbackFn && callbackFn(gameId);
        });

        /**
         * @param {string} gameId the game id
         * @param {string} username the name user joining the game
         * @param {function} callbackFn callback which is passed the newly created playerId
         */
        socket.on('join-game', async (gameId, username, callbackFn) => {
            socket.join(gameId);
            const playerId = await db.addPlayerToGame(redis, gameId, username);
            const [, players] = await Promise.all([
                db.setPlayerSocket(redis, gameId, playerId, socket.id),
                db.getGamePlayers(redis, gameId),
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
            try {
                await startRoundEvents(gameId, true);
                callbackFn && callbackFn();
            } catch (err) {
                console.error(err);
                io.to(socket.id).emit('error', err.toString());
            }
        });

        /**
         * @param {string} gameId the game id
         * @param {Number} playerId the id of the player playing the card
         * @param {string} cardSuit the suit of the card being played
         * @param {Number} cardValue the number of the card being played
         */
        socket.on('play-card', async (gameId, playerId, cardSuit, cardValue, callbackFn) => {
            try {
                const [round, trick] = await Promise.all([
                    db.getCurrentRound(redis, gameId),
                    db.getCurrentTrick(redis, gameId),
                ]);
                const { trickComplete, trickWinner, roundComplete, newLeadSuit } = await db.playCard(
                    redis, gameId, playerId, cardSuit, cardValue
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
                        await startRoundEvents(gameId, false);
                    } else {
                        // start new trick
                        const trickLeader = await db.getTrickLeader(redis, gameId, round, trick);
                        io.to(gameId).emit('trick-started', { round, trick, leader: trickLeader });
                    }
                }
                callbackFn && callbackFn();
            } catch (err) {
                console.error(err);
                io.to(socket.id).emit('error', err.toString());
            }
        });

        /**
         * @param {string} gameId the game the bet is for
         * @param {Number} playerId the player the bet is for
         * @param {Number} bet the bet being placed
         * @param {function} callbackFn
         */
        socket.on('place-bet', async (gameId, playerId, bet, callbackFn) => {
            try {
                const [round] = await db.getCurrentRound(redis, gameId);
                const [allBetsIn, trickLeader] = await Promise.all([
                    db.setPlayerBet(redis, gameId, playerId, round, bet),
                    db.getTrickLeader(redis, gameId, round, 0)
                ]);
                io.to(gameId).emit('bet-placed', { playerId, bet });
                if (allBetsIn) {
                    io.to(gameId).emit('trick-started', { trick: 0, leader: trickLeader });
                }
                callbackFn && callbackFn();
            } catch (err) {
                console.error(err);
                io.to(socket.id).emit('error', err.toString());
            }
        });

        socket.on('get-users', async (gameId, callbackFn) => {
            const players = await db.getGamePlayers(redis, gameId);
            callbackFn && callbackFn(
                players.map((name, index) => ({ name, playerId: index }))
            );
        });

    });


    return {
        db: redis,
        close: () => {
            http.close();
            db.close(redis);
        }
    };
};

module.exports = {
    server,
};
