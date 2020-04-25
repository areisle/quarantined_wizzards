import React, { createContext, useReducer, ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import * as io from 'socket.io-client';
import { setQueryStringParam, setPlayerId, getPlayerId } from './utilities';
import { initialState, gameReducer } from './reducer';
import { Snackbar, SnackbarContent } from '@material-ui/core';
import { API, GameState, Card, PlayerId, CardPlayedParams, RejoinGameParams, BetPlacedParams, RoundStartedParams, TrickStartedParams, USER_EVENTS, SERVER_EVENTS } from '../types';

interface ContextValue extends GameState {
    startNewGame: () => void;
    joinGame: (username: string) => void;
    playCard: (cardIndex: number) => void;
    allPlayersIn: () => void;
    placeBet: (bet: number) => void;
    readyForNextTrick: () => void;
}

const GameContext = createContext<ContextValue>({
    ...initialState,
    startNewGame: () => {},
    joinGame: (username: PlayerId) => {},
    playCard: (cardIndex: number) => {},
    allPlayersIn: () => {},
    placeBet: (bet: number) => {},
    readyForNextTrick: () => {},
});

type PlayersChangedParams = PlayerId[];

function logger<T extends (...args: any) => any = any>(func: T): typeof func {
    return ((...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(...args);
        }
        return func(...args);
    }) as unknown as typeof func
}

interface SnackbarState {
    open: boolean;
    message?: string | null;
}

function GameContextProvider(props: { children: ReactNode }) {
    const { children } = props;
    const [state, dispatch] = useReducer(logger(gameReducer), initialState);
    const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
    });
    
    const {
        gameCode,
        playerId,
        cards,
    } = state;

    useEffect(() => {
        if (!gameCode || playerId) {
            return;
        }
        const storedId = getPlayerId(gameCode);

        if (!storedId) { return; }
        
        socket?.emit(USER_EVENTS.REJOIN_GAME, gameCode, storedId, (gameState: RejoinGameParams) => {
            dispatch({
                type: USER_EVENTS.REJOIN_GAME,
                payload: {
                    ...gameState,
                    playerId: storedId,
                },
            });
        });
    }, [gameCode, playerId, socket]);

    useEffect(() => {
        const nextSocket = io.connect(API);
        setSocket(nextSocket);

        nextSocket.on(SERVER_EVENTS.ACTIVE_PLAYER_CHANGED, (playerId: PlayerId) => {
            dispatch({
                type: SERVER_EVENTS.ACTIVE_PLAYER_CHANGED,
                payload: playerId,
            });
        });

        nextSocket.on(SERVER_EVENTS.BET_PLACED, (params: BetPlacedParams) => {
            dispatch({
                type: SERVER_EVENTS.BET_PLACED,
                payload: params,
            });
        });

        nextSocket.on(SERVER_EVENTS.CARD_PLAYED, (params: CardPlayedParams) => {
            dispatch({
                type: SERVER_EVENTS.CARD_PLAYED,
                payload: params,
            });
        });

        nextSocket.on(SERVER_EVENTS.PLAYERS_CHANGED, (players: PlayersChangedParams) => {
            dispatch({
                type: SERVER_EVENTS.PLAYERS_CHANGED,
                payload: players,
            });
        });

        nextSocket.on(SERVER_EVENTS.ROUND_STARTED, (params: RoundStartedParams) => {
            dispatch({
                type: SERVER_EVENTS.ROUND_STARTED,
                payload: params,
            });
        });

        nextSocket.on(SERVER_EVENTS.TRICK_WON, ({ playerId }: { playerId: PlayerId }) => {
            dispatch({
                type: SERVER_EVENTS.TRICK_WON,
                payload: playerId,
            });
        });

        nextSocket.on(SERVER_EVENTS.TRUMP_CHANGED, (card: Card) => {
            dispatch({
                type: SERVER_EVENTS.TRUMP_CHANGED,
                payload: card,
            });
        });

        nextSocket.on(SERVER_EVENTS.TRICK_STARTED, (params: TrickStartedParams) => {
            dispatch({
                type: SERVER_EVENTS.TRICK_STARTED,
                payload: params,
            });
        });

        nextSocket.on(SERVER_EVENTS.PLAYER_READY, (params: PlayerId) => {
            dispatch({
                type: SERVER_EVENTS.PLAYER_READY,
                payload: params,
            });
        });

        nextSocket.on(SERVER_EVENTS.ERROR, (error: unknown) => {
            setSnackbar({
                open: true,
                message: String(error),
            })
        });

        nextSocket.on('disconnect', (reason: string) => {
            if (['io server disconnect', 'ping timeout'].includes(reason)) {
                nextSocket.connect();
            }
        });

        return () => {
            nextSocket.disconnect();
        }
    }, [dispatch]);

    const startNewGame = useCallback((newGameId: string = '') => {
        if (newGameId) {
            setQueryStringParam('game', newGameId);
        } else {
            socket?.emit(USER_EVENTS.CREATE_GAME, (gameCode: string) => {
                dispatch({
                    type: USER_EVENTS.CREATE_GAME,
                    payload: gameCode,
                });
                setQueryStringParam('game', gameCode)
            });
        }
    }, [socket]);

    const joinGame = useCallback((username: string) => {
        socket?.emit(USER_EVENTS.JOIN_GAME, gameCode, username, (playerId: PlayerId) => {
            dispatch({
                type: USER_EVENTS.JOIN_GAME,
                payload: playerId,
            });
            setPlayerId(gameCode, playerId);
        })
    }, [gameCode, socket]);

    const playCard = useCallback((cardIndex: number) => {
        socket?.emit(USER_EVENTS.PLAY_CARD, gameCode, playerId, cards[cardIndex]);
    }, [cards, gameCode, playerId, socket]);

    const allPlayersIn = useCallback(() => {
        socket?.emit(USER_EVENTS.START_GAME, gameCode, () => {
            dispatch({
                type: USER_EVENTS.START_GAME,
            });
        })
    }, [gameCode, socket]);

    const placeBet = useCallback((bet: number) => {
        socket?.emit(USER_EVENTS.PLACE_BET, gameCode, playerId, bet);
    }, [gameCode, playerId, socket]);

    const readyForNextTrick = useCallback(() => {
        socket?.emit(USER_EVENTS.READY_FOR_NEXT_TRICK, gameCode, playerId);
    }, [gameCode, playerId, socket]);

    useEffect(() => {
        if (gameCode) {
            socket?.emit(USER_EVENTS.GET_PLAYERS, gameCode, (players: PlayersChangedParams) => {
                dispatch({
                    type: SERVER_EVENTS.PLAYERS_CHANGED,
                    payload: players,
                });
            })
        }
    }, [gameCode, socket]);

    const value = useMemo(() => ({
        ...state,
        startNewGame,
        joinGame,
        playCard,
        allPlayersIn,
        placeBet,
        readyForNextTrick,
    }), [allPlayersIn, joinGame, placeBet, playCard, readyForNextTrick, startNewGame, state]);

    return (
        <GameContext.Provider value={value}>
            {children}
            <Snackbar 
                open={snackbar.open} 
                onClose={() => setSnackbar({ open: false })}
            >
                <SnackbarContent
                    message={snackbar.message}
                />
            </Snackbar>
        </GameContext.Provider>
    )
}

export {
    GameContext,
    GameContextProvider,
}