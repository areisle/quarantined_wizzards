import produce from 'immer';
import update from 'lodash.update';

import {
    BetPlacedParams,
    CardPlayedParams,
    GAME_STAGE,
    GameState,
    PlayerId,
    RejoinGameParams,
    RoundStartedParams,
    SERVER_EVENTS,
    SUIT,
    TrickStartedParams,
    USER_EVENTS,
} from '../types';
import { createReducer, removeFirst } from './utilities';

const initialState: GameState = {
    players: [],
    cards: [],
    scores: [],
    roundNumber: 0,
    trickNumber: 0,
    trickWinner: null,
    trickCards: {},
    ready: {},
    stage: GAME_STAGE.SETTING_UP,
    playerId: null,
    trickLeader: null,
    activePlayer: null,
    trumpSuit: null,
    gameCode: (new URLSearchParams(window.location.search)).get('game'),
};

const gameReducer = createReducer<GameState>({
    [SERVER_EVENTS.TRUMP_CHANGED]: (state, trumpSuit: SUIT) => ({
        ...state,
        trumpSuit,
        stage: GAME_STAGE.BETTING,
    }),
    [SERVER_EVENTS.TRICK_WON]: (state, playerId: PlayerId) => produce(state, (draft) => {
        update(
            draft,
            ['scores', state.roundNumber, playerId, 'taken'],
            (previous) => (previous || 0) + 1,
        );
        draft.trickWinner = playerId;
        draft.stage = GAME_STAGE.BETWEEN_TRICKS;
    }),
    [SERVER_EVENTS.ACTIVE_PLAYER_CHANGED]: (state, activePlayer: PlayerId) => ({
        ...state,
        activePlayer,
    }),
    [SERVER_EVENTS.BET_PLACED]: (state, params: BetPlacedParams) => {
        const { playerId, bet } = params;
        return produce(state, (draft) => {
            update(
                draft,
                ['scores', state.roundNumber, playerId, 'bet'],
                () => bet,
            );
        });
    },
    [SERVER_EVENTS.PLAYERS_CHANGED]: (state, players: PlayerId[]) => ({
        ...state,
        players,
    }),
    [SERVER_EVENTS.CARD_PLAYED]: (state, { card, playerId }: CardPlayedParams) => {
        let { cards } = state;
        if (playerId === state.playerId) {
            cards = removeFirst(cards, card);
        }
        return {
            ...state,
            trickCards: {
                ...state.trickCards,
                [playerId]: card,
            },
            cards,
        };
    },
    [SERVER_EVENTS.ROUND_STARTED]: (state, params: RoundStartedParams) => ({
        ...state,
        cards: params.cards,
        roundNumber: params.roundNumber,
        trickCards: {},
        trickLeader: params.trickLeader,
        trickWinner: null,
        ready: {},
        stage: GAME_STAGE.BETTING,
    }),
    [SERVER_EVENTS.TRICK_STARTED]: (state, params: TrickStartedParams) => ({
        ...state,
        trickNumber: params.trickNumber,
        trickLeader: params.trickLeader,
        trickWinner: null,
        trickCards: {},
        ready: {},
        stage: GAME_STAGE.PLAYING,
    }),
    [USER_EVENTS.CREATE_GAME]: (state, gameCode: string) => ({
        ...state,
        gameCode,
    }),
    [USER_EVENTS.JOIN_GAME]: (state, playerId: PlayerId) => ({
        ...state,
        playerId,
    }),
    [SERVER_EVENTS.PLAYER_READY]: (state, playerId: PlayerId) => ({
        ...state,
        ready: {
            ...state.ready,
            [playerId]: true,
        },
    }),
    [USER_EVENTS.REJOIN_GAME]: (state, gameState: RejoinGameParams) => ({
        ...state,
        ...gameState,
    }),
    [SERVER_EVENTS.GAME_COMPLETE]: (state) => ({
        ...state,
        stage: GAME_STAGE.COMPLETE,
    }),
});

export {
    gameReducer,
    initialState,
};
