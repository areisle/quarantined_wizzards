import React, { createContext, useReducer, ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import * as io from 'socket.io-client';
import { API, SERVER_EVENTS, USER_EVENTS } from './contants';
import { setQueryStringParam } from './utilities';
import { initialState, gameReducer, CardPlayedParams } from './reducer';
import { GameState, Card } from '../types';

interface ContextValue extends GameState {
    startNewGame: () => void;
    joinGame: (username: string) => void;
    playCard: (cardIndex: number) => void;
    allPlayersIn: () => void;
}

const GameContext = createContext<ContextValue>({
    ...initialState,
    startNewGame: () => {},
    joinGame: (username: string) => {},
    playCard: (cardIndex: number) => {},
    allPlayersIn: () => {},
});

type PlayersChangedParams = { playerId: number, name: string }[];

function GameContextProvider(props: { children: ReactNode }) {
    const { children } = props;
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

    const {
        gameCode
    } = state;

    useEffect(() => {
        const nextSocket = io.connect(API);
        setSocket(nextSocket);

        nextSocket.on(SERVER_EVENTS.ACTIVE_PLAYER_CHANGED, (playerIndex: number) => {
            dispatch({
                type: SERVER_EVENTS.ACTIVE_PLAYER_CHANGED,
                payload: playerIndex,
            });
        });

        nextSocket.on(SERVER_EVENTS.CARD_PLAYED, (params: CardPlayedParams) => {
            dispatch({
                type: SERVER_EVENTS.CARD_PLAYED,
                payload: params,
            });
        });

        nextSocket.on(SERVER_EVENTS.CARDS_DEALT, (cards: Card[]) => {
            dispatch({
                type: SERVER_EVENTS.CARDS_DEALT,
                payload: cards,
            });
        });

        nextSocket.on(SERVER_EVENTS.PLAYERS_CHANGED, (players: PlayersChangedParams) => {
            console.log(SERVER_EVENTS.PLAYERS_CHANGED, players)
            dispatch({
                type: SERVER_EVENTS.PLAYERS_CHANGED,
                payload: players.map((player) => player.name),
            });
        });

        nextSocket.on(SERVER_EVENTS.ROUND_STARTED, (roundNumber: number) => {
            dispatch({
                type: SERVER_EVENTS.ROUND_STARTED,
                payload: roundNumber,
            });
        });

        nextSocket.on(SERVER_EVENTS.TRICK_WON, (playerId: number) => {
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

        nextSocket.on(SERVER_EVENTS.TRICK_STARTED, (trickNumber: number) => {
            dispatch({
                type: SERVER_EVENTS.TRICK_STARTED,
                payload: trickNumber,
            });
        });

        return () => {
            nextSocket.disconnect();
        }

    }, [dispatch]);

    const startNewGame = useCallback(() => {
        socket?.emit(USER_EVENTS.CREATE_GAME, (gameCode: string) => {
            dispatch({
                type: USER_EVENTS.CREATE_GAME,
                payload: gameCode,
            });
            setQueryStringParam('game', gameCode)
        })
    }, [socket]);

    const joinGame = useCallback((username: string) => {
        socket?.emit(USER_EVENTS.JOIN_GAME, gameCode, username, (playerId: number) => {
            dispatch({
                type: USER_EVENTS.JOIN_GAME,
                payload: playerId,
            });
        })
    }, [gameCode, socket]);

    const playCard = useCallback(() => {
        socket?.emit(USER_EVENTS.PLAY_CARD, (cardIndex: number) => {
            dispatch({
                type: USER_EVENTS.PLAY_CARD,
                payload: cardIndex,
            });
        })
    }, [socket]);

    const allPlayersIn = useCallback(() => {
        socket?.emit(USER_EVENTS.START_GAME, gameCode, () => {
            dispatch({
                type: USER_EVENTS.START_GAME,
            });
        })
    }, [gameCode, socket]);

    const value = useMemo(() => ({
        ...state,
        startNewGame,
        joinGame,
        playCard,
        allPlayersIn,
    }), [allPlayersIn, joinGame, playCard, startNewGame, state]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    )
}

export {
    GameContext,
    GameContextProvider,
}