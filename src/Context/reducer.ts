import { SERVER_EVENTS, USER_EVENTS } from './contants';
import { createReducer } from './utilities';
import produce from "immer"
import update from 'lodash.update';
import { GameState, Card } from '../types';

export interface CardPlayedParams {
    playerId: number;
    card: Card;
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

const gameReducer = createReducer<GameState>({
    [SERVER_EVENTS.TRUMP_CHANGED]: (state, trumpCard: Card) => ({
        ...state,
        trumpCard,
    }),
    [SERVER_EVENTS.TRICK_WON]: (state, playerIndex: number) => {
        return produce(state, (draft) => {
            update(
                draft, 
                ['scores', state.roundNumber, playerIndex, 'taken'],
                (previous) => (previous || 0) + 1,
            )
        });
    },
    [SERVER_EVENTS.ACTIVE_PLAYER_CHANGED]: (state, activePlayer: number) => ({
        ...state,
        activePlayer,
    }),
    [SERVER_EVENTS.PLAYERS_CHANGED]: (state, players: string[]) => ({
        ...state,
        players,
    }),
    [SERVER_EVENTS.CARDS_DEALT]: (state, cards: Card[]) => ({
        ...state,
        cards,
    }),
    [SERVER_EVENTS.CARD_PLAYED]: (state, { card, playerId }: CardPlayedParams) => ({
        ...state,
        trickCards: {
            ...state.trickCards,
            [playerId]: card,
        }
    }),
    [SERVER_EVENTS.ROUND_STARTED]: (state, roundNumber: number) => ({
        ...state,
        stage: 'betting',
        roundNumber,
    }),
    [SERVER_EVENTS.TRICK_STARTED]: (state, trickNumber: number) => ({
        ...state,
        trickNumber,
        stage: 'playing',
    }),
    [USER_EVENTS.CREATE_GAME]: (state, gameCode: string) => ({
        ...state,
        gameCode,
    }),
    [USER_EVENTS.JOIN_GAME]: (state, playerNumber: number) => ({
        ...state,
        playerNumber,
    }),
    [USER_EVENTS.PLAY_CARD]: (state, cardIndex: number) => ({
        ...state,
        cards: [
            ...state.cards.slice(0, cardIndex), 
            ...state.cards.slice(cardIndex + 1),
        ]
    }),
    // @todo not supported by server
    [USER_EVENTS.REJOIN_GAME]: (state) => state,
})

export {
    gameReducer,
    initialState,
}