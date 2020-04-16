import { createReducer, removeFirst } from './utilities';
import produce from "immer"
import update from 'lodash.update';
import { GameState, Card, PlayerId, BetPlacedParams, CardPlayedParams, RoundStartedParams, TrickStartedParams, RejoinGameParams, SERVER_EVENTS, USER_EVENTS } from '../types';

const initialState: GameState = {
    players: [],
    cards: [],
    scores: [],
    roundNumber: 0,
    trickNumber: 0,
    trickWinner: null,
    trickCards: {},
    stage: 'awaiting-players',
    playerId: null,
    trickLeader: null,
    activePlayer: null,
    trumpSuit: null,
    gameCode: (new URLSearchParams(window.location.search)).get('game'),
}

const gameReducer = createReducer<GameState>({
    [SERVER_EVENTS.TRUMP_CHANGED]: (state, trumpSuit: Card['suit']) => ({
        ...state,
        trumpSuit,
        stage: 'betting',
    }),
    [SERVER_EVENTS.TRICK_WON]: (state, playerId: PlayerId) => {
        return produce(state, (draft) => {
            update(
                draft,
                ['scores', state.roundNumber, playerId, 'taken'],
                (previous) => (previous || 0) + 1,
            );
            state.trickWinner = playerId;
        });
    },
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
            )
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
        trickLeader: params.trickLeader,
    }),
    [SERVER_EVENTS.TRICK_STARTED]: (state, params: TrickStartedParams) => ({
        ...state,
        trickNumber: params.trickNumber,
        trickLeader: params.trickLeader,
        trickWinner: null,
        trickCards: {},
        stage: 'playing',
    }),
    [USER_EVENTS.CREATE_GAME]: (state, gameCode: string) => ({
        ...state,
        gameCode,
    }),
    [USER_EVENTS.JOIN_GAME]: (state, playerId: PlayerId) => ({
        ...state,
        playerId,
    }),
    [USER_EVENTS.REJOIN_GAME]: (state, gameState: RejoinGameParams): GameState => {
        const { gameStarted, allBetsIn, ...rest } = gameState;

        let stage: GameState['stage'] = 'awaiting-players';
        if (gameStarted && allBetsIn) {
            stage = 'playing';
        } else if (gameStarted) {
            stage = 'betting'
        }

        return {
            ...state,
            ...rest,
            stage,
        }
    },
})

export {
    gameReducer,
    initialState,
}
