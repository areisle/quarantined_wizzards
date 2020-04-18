/**
 * TESTING ONLY
 * 
 * fixed game states for helping in developing components
 */
import { GameState, GAME_STAGE, SUIT } from "../types";

export const newGameState: GameState = {
    players: [],
    cards: [],
    scores: [],
    roundNumber: 0,
    trickNumber: 0,
    trickCards: {},
    stage: GAME_STAGE.SETTING_UP,
    playerId: 'abbey',
    trickLeader: null,
    activePlayer: null,
    trumpSuit: null,
    gameCode: null,
    trickWinner: null,
    ready: {},
}

export const startState: GameState = {
    players: [
        'abbey', 
        'fritz', 
        'karen', 
    ],
    cards: [],
    scores: [],
    roundNumber: 0,
    trickNumber: 0,
    trickCards: {},
    stage: GAME_STAGE.SETTING_UP,
    playerId: 'abbey',
    trickLeader: null,
    activePlayer: null,
    trumpSuit: null,
    gameCode: '1234',
    trickWinner: null,
    ready: {},
}

export const bettingState: GameState = {
    players: [
        'abbey', 
        'fritz', 
        'karen', 
        'martin', 
        'caralyn', 
        'natalie'
    ],
    cards: [
        { suit:  SUIT.JESTER },
        { suit:  SUIT.WIZARD },
        { suit:  SUIT.JESTER },
        { suit:  SUIT.WIZARD },
        { suit:  SUIT.JESTER },
        { suit:  SUIT.WIZARD },
        { suit:  SUIT.HEARTS, number: 1 },
        { suit:  SUIT.HEARTS, number: 11 },
        { suit:  SUIT.HEARTS, number: 7 },
        { suit:  SUIT.CLUBS, number: 1 },
        { suit:  SUIT.CLUBS, number: 3 },
        { suit:  SUIT.CLUBS, number: 12 },
        { suit:  SUIT.JESTER },
        { suit:  SUIT.WIZARD },
        { suit:  SUIT.HEARTS, number: 1 },
        { suit:  SUIT.HEARTS, number: 11 },
        { suit:  SUIT.HEARTS, number: 7 },
        { suit:  SUIT.CLUBS, number: 1 },
        { suit:  SUIT.CLUBS, number: 3 },
        { suit:  SUIT.CLUBS, number: 12 },
    ],
    scores: [
        {
            'abbey': { bet: 0 },
            'karen': { bet: 1 },
            'natalie': { bet: 1 },
        }
    ],
    roundNumber: 0,
    trickNumber: 0,
    trickCards: {},
    stage: GAME_STAGE.BETTING,
    playerId: 'abbey',
    trickLeader: 'abbey',
    activePlayer: null,
    trumpSuit:  SUIT.DIAMONDS,
    gameCode: '1234',
    trickWinner: null,
    ready: {},
}

export const playingState: GameState = {
    players: [
        'abbey', 
        'fritz', 
        'karen', 
        'martin', 
        'caralyn', 
        'natalie'
    ],
    cards: [
        { suit:  SUIT.JESTER },
        { suit:  SUIT.HEARTS, number: 1 },
        { suit:  SUIT.CLUBS, number: 12 },
    ],
    scores: [
        {
            'abbey': { bet: 0, taken: 0 },
            'fritz': { bet: 0, taken: 0 },
            'karen': { bet: 0, taken: 0 },
            'martin': { bet: 1, taken: 0 },
            'caralyn': { bet: 1, taken: 0 },
            'natalie': { bet: 1, taken: 1 },
        },
        {
            'abbey': { bet: 0, taken: 0 },
            'fritz': { bet: 0, taken: 1 },
            'karen': { bet: 2, taken: 1 },
            'martin': { bet: 1, taken: 0 },
            'caralyn': { bet: 1, taken: 0 },
            'natalie': { bet: 0, taken: 0 },
        }
    ],
    roundNumber: 2,
    trickNumber: 0,
    trickCards: {},
    stage: GAME_STAGE.PLAYING,
    playerId: 'abbey',
    trickLeader: 'abbey',
    activePlayer: null,
    trumpSuit:  SUIT.DIAMONDS,
    gameCode: '1234',
    trickWinner: null,
    ready: {},
}

export const playingDuringTrickState: GameState = {
    players: [
        'abbey', 
        'fritz', 
        'karen', 
        'martin', 
        'caralyn', 
        'natalie'
    ],
    cards: [
        { suit:  SUIT.JESTER },
        { suit:  SUIT.CLUBS, number: 12 },
    ],
    scores: [
        {
            'abbey': { bet: 0, taken: 0 },
            'fritz': { bet: 0, taken: 0 },
            'karen': { bet: 0, taken: 0 },
            'martin': { bet: 1, taken: 0 },
            'caralyn': { bet: 1, taken: 0 },
            'natalie': { bet: 1, taken: 1 },
        },
        {
            'abbey': { bet: 0, taken: 0 },
            'fritz': { bet: 0, taken: 1 },
            'karen': { bet: 2, taken: 1 },
            'martin': { bet: 1, taken: 0 },
            'caralyn': { bet: 1, taken: 0 },
            'natalie': { bet: 0, taken: 0 },
        }
    ],
    roundNumber: 2,
    trickNumber: 0,
    trickCards: {
        'abbey': { suit:  SUIT.HEARTS, number: 1 },
        'fritz': { suit:  SUIT.HEARTS, number: 7 },
        'karen': { suit:  SUIT.JESTER },
    },
    stage: GAME_STAGE.PLAYING,
    playerId: 'abbey',
    trickLeader: 'abbey',
    activePlayer: 'martin',
    trumpSuit:  SUIT.DIAMONDS,
    gameCode: '1234',
    trickWinner: null,
    ready: {},
}