import React, { createContext, useReducer, ReactNode, useState } from 'react';

export interface Card {
    suit?: 'hearts' | 'diamonds' | 'spades' | 'clubs' | null;
    number?: number | null;
    special?: 'wizard' | 'jester' | null;
}

type PlayerNumber = number;
type RoundNumber = number;

// for now player ids can just be numbers?
export interface GameState {
    players: string[];
    scores: Record<
        // round number
        RoundNumber, 
        Record<
            // user number
            PlayerNumber, 
            Partial<Record<'bet' | 'taken', number | null>>
        >
    >;
    roundNumber: RoundNumber;
    trickNumber: number;
    stage: 'awaiting-players' | 'betting' | 'playing';
    cards: Card[];
    trickCards: Record<PlayerNumber, Card | null>;
    playerNumber: PlayerNumber | null;
    trickLeader: PlayerNumber | null;
    activePlayer: PlayerNumber | null;
    trumpCard: Card | null;
    gameCode: string | null;
}


const initialState: GameState = {
    players: [],
    cards: [],
    scores: {},
    roundNumber: 0,
    trickNumber: 0,
    trickCards: [],
    stage: 'awaiting-players',
    playerNumber: null,
    trickLeader: null,
    activePlayer: null,
    trumpCard: null,
    gameCode: (new URLSearchParams(window.location.search)).get('game'),
}

const GameContext = createContext(initialState);

function gameReducer(state: GameState, action: { type: string; payload: any }) {
    return state;
}

function GameContextProvider(props: { children: ReactNode }) {
    const { children } = props;
    const [state, dispatch] = useReducer(gameReducer, initialState);

    return (
        <GameContext.Provider value={state}>
            {children}
        </GameContext.Provider>
    )
}

export {
    GameContext,
    GameContextProvider,
}