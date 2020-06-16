import express from 'express';
import { Server } from 'http';
import path from 'path';
import socketio from 'socket.io';

import {
    CardPlayedParams,
    RoundStartedParams,
    SERVER_EVENTS,
    TrickStartedParams,
    USER_EVENTS,
} from '../src/types';
import * as db from './db';

const app = express();
const http = new Server(app);
const io = socketio(http);

app.use(express.static(path.join(__dirname, '../../build')));

app.get('*', (_, res) => {
    const filePath = path.join(__dirname, '../../build/index.html');
    res.sendFile(filePath);
});

const server = async ({ port = 3000 }: { port: string | number }) => {
    const redis = await db.connect();
    await http.listen(port);
    console.log(`listening on localhost:${port}`);
    // WARNING: app.listen(80) will NOT work here!

    app.get('/', (req, res) => {
        res.sendFile(`${__dirname}/tester.html`);
    });

    const startRoundEvents = async (gameId: string, firstRound: boolean = false) => {
        // send a private message to each player with their cards
        const { cards, trump, roundNumber } = await (firstRound
            ? db.startGame(redis, gameId)
            : db.startRound(redis, gameId));
        const activeUser = await db.whosTurnIsIt(redis, gameId);

        await Promise.all(Object.keys(cards).map(async (playerId) => {
            const socketId = await db.getPlayerSocket(redis, gameId, playerId);

            if (!socketId) {
                console.error(`no socketId found for player ${playerId} for game ${gameId}`);
                return;
            }

            const data: RoundStartedParams = {
                cards: cards[playerId],
                roundNumber,
                trump,
                trickLeader: activeUser,
            };

            io.to(socketId).emit(
                SERVER_EVENTS.ROUND_STARTED,
                data,
            );
        }));

        io.to(gameId).emit(SERVER_EVENTS.TRUMP_CHANGED, trump);
    };

    io.on('connection', (socket) => {
        /**
         * @param {function} onSuccess callback which is passed the newly created gameId
         */
        socket.on(USER_EVENTS.CREATE_GAME, async (onSuccess) => {
            const gameId = await db.createGame(redis);
            onSuccess?.(gameId);
        });

        /**
         * @param {string} gameId the game id
         * @param {string} username the name user joining the game
         * @param {function} onSuccess callback which is passed the newly created playerId
         */
        socket.on(USER_EVENTS.JOIN_GAME, async (gameId: string, playerId: string, onSuccess, onError) => {
            try {
                socket.join(gameId);
                await db.addPlayerToGame(redis, gameId, playerId);
                const [, players] = await Promise.all([
                    db.setPlayerSocket(redis, gameId, playerId, socket.id),
                    db.getGamePlayers(redis, gameId),
                ]);
                onSuccess?.(playerId);
                io.to(gameId).emit(SERVER_EVENTS.PLAYERS_CHANGED, players);
            } catch (err) {
                onError?.(err);
                console.error(err);
                io.to(socket.id).emit(SERVER_EVENTS.ERROR, err.toString());
            }
        });

        /**
         * @param {string} gameId the game id
         * @param {string} username the name user joining the game
         * @param {function} onSuccess callback which is passed the newly created playerId
         */
        socket.on(USER_EVENTS.REJOIN_GAME, async (gameId: string, playerId: string, onSuccess, onError) => {
            try {
                await db.playerExists(redis, gameId, playerId);
                socket.join(gameId);
                const [, gameState] = await Promise.all([
                    db.setPlayerSocket(redis, gameId, playerId, socket.id),
                    db.getGameState(redis, gameId, playerId),
                ]);
                onSuccess?.(gameState);
            } catch (err) {
                onError?.(err);
                console.error(err);
                io.to(socket.id).emit(SERVER_EVENTS.ERROR, err.toString());
            }
        });

        /**
         * @param {string} gameId the game id
         */
        socket.on(USER_EVENTS.START_GAME, async (gameId: string, onSuccess, onError) => {
            // deal the cards
            try {
                await startRoundEvents(gameId, true);
                onSuccess?.();
            } catch (err) {
                onError?.(err);
                console.error(err);
                io.to(socket.id).emit(SERVER_EVENTS.ERROR, err.toString());
            }
        });

        /**
         * @param gameId the game id
         * @param playerId the id of the player playing the card
         * @param cardSuit the suit of the card being played
         * @param cardValue the number of the card being played
         */
        socket.on(USER_EVENTS.PLAY_CARD, async (gameId: string, playerId: string, { suit: cardSuit, number: cardValue }, onSuccess, onError) => {
            try {
                await db.playerExists(redis, gameId, playerId);

                const { trickWinner, newLeadSuit } = await db.playCard(
                    redis, gameId, playerId, cardSuit, cardValue,
                );

                onSuccess?.();

                const data: CardPlayedParams = {
                    card: { suit: cardSuit, number: cardValue },
                    playerId,
                };

                io.to(gameId).emit(SERVER_EVENTS.CARD_PLAYED, data);

                // get the new player
                const activeUser = await db.whosTurnIsIt(redis, gameId);
                io.to(gameId).emit(SERVER_EVENTS.ACTIVE_PLAYER_CHANGED, activeUser);

                if (newLeadSuit) {
                    io.to(gameId).emit('lead-changed', newLeadSuit);
                }
                if (trickWinner) {
                    io.to(gameId).emit(SERVER_EVENTS.TRICK_WON, { playerId: trickWinner });
                }
            } catch (err) {
                onError?.(err);
                console.error(err);
                io.to(socket.id).emit(SERVER_EVENTS.ERROR, err.toString());
            }
        });

        /**
         * @param gameId the game the bet is for
         * @param playerId the player the bet is for
         * @param bet the bet being placed
         * @param onSuccess
         */
        socket.on(USER_EVENTS.PLACE_BET, async (gameId: string, playerId: string, bet: number, onSuccess, onError) => {
            try {
                const [roundNumber] = await Promise.all([
                    db.getCurrentRound(redis, gameId),
                    db.playerExists(redis, gameId, playerId),
                ]);
                const [allBetsIn, trickLeader] = await Promise.all([
                    db.setPlayerBet(redis, gameId, playerId, roundNumber, bet),
                    db.getTrickLeader(redis, gameId, roundNumber, 0),
                ]);

                onSuccess?.();

                io.to(gameId).emit(SERVER_EVENTS.BET_PLACED, { playerId, bet });
                if (allBetsIn) {
                    // get the new player
                    const activeUser = await db.whosTurnIsIt(redis, gameId);
                    io.to(gameId).emit(SERVER_EVENTS.ACTIVE_PLAYER_CHANGED, activeUser);

                    const data: TrickStartedParams = {
                        roundNumber,
                        trickNumber: 0,
                        trickLeader,
                    };

                    io.to(gameId).emit(SERVER_EVENTS.TRICK_STARTED, data);
                }
            } catch (err) {
                onError?.(err);
                console.error(err);
                io.to(socket.id).emit(SERVER_EVENTS.ERROR, err.toString());
            }
        });

        socket.on(USER_EVENTS.GET_PLAYERS, async (gameId, onSuccess) => {
            const players = await db.getGamePlayers(redis, gameId);
            onSuccess?.(players);
        });

        socket.on(USER_EVENTS.READY_FOR_NEXT_TRICK, async (gameId: string, playerId: string, onSuccess, onError) => {
            try {
                const [roundNumber, trickNumber, roundComplete, trickComplete] = await Promise.all([
                    db.getCurrentRound(redis, gameId),
                    db.getCurrentTrick(redis, gameId),
                    db.currentRoundIsComplete(redis, gameId),
                    db.currentTrickIsComplete(redis, gameId),
                ]);

                if (!trickComplete) {
                    throw new Error(`Player (${playerId}) cannot say ready before the current trick (${trickNumber}) is complete`);
                }
                await db.setPlayerReady(redis, gameId, roundNumber, trickNumber, playerId);
                const [players, playersReady] = await Promise.all([
                    db.getGamePlayers(redis, gameId),
                    db.getPlayersReady(redis, gameId, roundNumber, trickNumber),
                ]);

                onSuccess?.();

                io.to(gameId).emit(SERVER_EVENTS.PLAYER_READY, playerId);

                if (players.length === playersReady.length) {
                    if (!roundComplete) {
                        await db.setCurrentTrick(redis, gameId, trickNumber + 1);

                        // start new trick
                        const trickLeader = await db.getTrickLeader(redis, gameId, roundNumber, trickNumber + 1);

                        const trickData: TrickStartedParams = {
                            roundNumber,
                            trickNumber: trickNumber + 1,
                            trickLeader,
                        };

                        io.to(gameId).emit(SERVER_EVENTS.TRICK_STARTED, trickData);
                        io.to(gameId).emit(SERVER_EVENTS.ACTIVE_PLAYER_CHANGED, trickLeader);
                    } else if (roundNumber === (db.TOTAL_CARDS / players.length - 1)) {
                        io.to(gameId).emit(SERVER_EVENTS.GAME_COMPLETE);
                    } else {
                        await Promise.all([
                            db.setCurrentTrick(redis, gameId, 0),
                            db.setCurrentRound(redis, gameId, roundNumber + 1),
                        ]);
                        // re-deal cards
                        await startRoundEvents(gameId, false);
                    }
                }
            } catch (err) {
                onError?.(err);
                console.error(err);
                io.to(socket.id).emit(SERVER_EVENTS.ERROR, err.toString());
            }
        });
    });

    return {
        db: redis,
        close: () => {
            http.close();
            db.close(redis);
        },
    };
};

export {
    server,
};
