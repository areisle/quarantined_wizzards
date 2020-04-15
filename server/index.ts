import express from "express";
import { Server } from 'http';
import socket from 'socket.io';
import * as db from './db';
const app = express();
const http = new Server(app);
const io = socket(http);

const server = async ({ port = 3000 }) => {
    const redis = await db.connect();
    await http.listen(port);
    console.log(`listening on localhost:${port}`);
    // WARNING: app.listen(80) will NOT work here!

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/tester.html');
    });

    const startRoundEvents = async (gameId: string, firstRound: boolean = false) => {
        // send a private message to each player with their cards
        const { cards, trump, roundNumber } = await (firstRound
            ? db.startGame(redis, gameId)
            : db.startRound(redis, gameId));
        const activeUser = await db.whosTurnIsIt(redis, gameId);

        io.to(gameId).emit('trump-changed', trump);

        await Promise.all(Object.keys(cards).map(async playerId => {
            const socketId = await db.getPlayerSocket(redis, gameId, playerId);

            io.to(socketId).emit(
                'round-started',
                { cards: cards[playerId], roundNumber, trump, trickLeader: activeUser }
            );
        }));
    };

    io.on('connection', function (socket) {
        /**
         * @param {function} onSuccess callback which is passed the newly created gameId
         */
        socket.on('create-game', async (onSuccess) => {
            const gameId = await db.createGame(redis);
            onSuccess && onSuccess(gameId);
        });

        /**
         * @param {string} gameId the game id
         * @param {string} username the name user joining the game
         * @param {function} onSuccess callback which is passed the newly created playerId
         */
        socket.on('join-game', async (gameId: string, playerId: string, onSuccess, onError) => {
            try {
                socket.join(gameId);
                await db.addPlayerToGame(redis, gameId, playerId);
                const [, players] = await Promise.all([
                    db.setPlayerSocket(redis, gameId, playerId, socket.id),
                    db.getGamePlayers(redis, gameId),
                ]);
                onSuccess && onSuccess(playerId);
                io.to(gameId).emit('users-changed', players);
            } catch (err) {
                onError && onError(err);
                console.error(err);
                io.to(socket.id).emit('error', err.toString());
            }
        });

        /**
         * @param {string} gameId the game id
         * @param {string} username the name user joining the game
         * @param {function} onSuccess callback which is passed the newly created playerId
         */
        socket.on('rejoin-game', async (gameId: string, playerId: string, onSuccess, onError) => {
            try {
                await db.playerExists(redis, gameId, playerId);
                socket.join(gameId);
                const [, gameState] = await Promise.all([
                    db.setPlayerSocket(redis, gameId, playerId, socket.id),
                    db.getGameState(redis, gameId, playerId),
                ]);
                onSuccess && onSuccess(gameState);
            } catch (err) {
                onError && onError(err);
                console.error(err);
                io.to(socket.id).emit('error', err.toString());
            }
        });

        /**
         * @param {string} gameId the game id
         */
        socket.on('start-game', async (gameId: string, onSuccess, onError) => {
            // deal the cards
            try {
                await startRoundEvents(gameId, true);
                onSuccess && onSuccess();
            } catch (err) {
                onError && onError(err);
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
        socket.on('play-card', async (gameId: string, playerId: string, { suit: cardSuit, number: cardValue }, onSuccess, onError) => {
            try {
                const [, roundNumber, trickNumber] = await Promise.all([
                    db.playerExists(redis, gameId, playerId),
                    db.getCurrentRound(redis, gameId),
                    db.getCurrentTrick(redis, gameId),
                ]);
                const { trickComplete, trickWinner, roundComplete, newLeadSuit } = await db.playCard(
                    redis, gameId, playerId, cardSuit, cardValue
                );

                onSuccess && onSuccess();

                io.to(gameId).emit('card-played', { card: { suit: cardSuit, number: cardValue }, playerId });

                // get the new player
                const activeUser = await db.whosTurnIsIt(redis, gameId);
                io.to(gameId).emit('active-user-changed', activeUser);

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
                        const trickLeader = await db.getTrickLeader(redis, gameId, roundNumber, trickNumber);
                        io.to(gameId).emit('trick-started', {
                            roundNumber, trickNumber, trickLeader
                        });
                    }
                }
            } catch (err) {
                onError && onError(err);
                console.error(err);
                io.to(socket.id).emit('error', err.toString());
            }
        });

        /**
         * @param {string} gameId the game the bet is for
         * @param {Number} playerId the player the bet is for
         * @param {Number} bet the bet being placed
         * @param {function} onSuccess
         */
        socket.on('place-bet', async (gameId: string, playerId: string, bet: number, onSuccess, onError) => {
            try {
                const [roundNumber,] = await Promise.all([
                    db.getCurrentRound(redis, gameId),
                    db.playerExists(redis, gameId, playerId),
                ]);
                const [allBetsIn, trickLeader] = await Promise.all([
                    db.setPlayerBet(redis, gameId, playerId, roundNumber, bet),
                    db.getTrickLeader(redis, gameId, roundNumber, 0)
                ]);

                onSuccess && onSuccess();

                io.to(gameId).emit('bet-placed', { playerId, bet });
                if (allBetsIn) {
                    // get the new player
                    const activeUser = await db.whosTurnIsIt(redis, gameId);
                    io.to(gameId).emit('active-user-changed', activeUser);
                    io.to(gameId).emit('trick-started', { roundNumber, trickNumber: 0, trickLeader });
                }
            } catch (err) {
                onError && onError(err);
                console.error(err);
                io.to(socket.id).emit('error', err.toString());
            }
        });

        socket.on('get-users', async (gameId, onSuccess) => {
            const players = await db.getGamePlayers(redis, gameId);
            onSuccess && onSuccess(players);
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

export {
    server,
};
