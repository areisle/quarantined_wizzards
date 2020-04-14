/**
 * TESTING ONLY
 * 
 * fixed game states for helping in developing components
 */
import { GameState } from "../types";

export const newGameState: GameState = {
    players: [],
    cards: [],
    scores: [],
    roundNumber: 0,
    trickNumber: 0,
    trickCards: {},
    stage: 'awaiting-players',
    playerId: 'abbey',
    trickLeader: null,
    activePlayer: null,
    trumpSuit: null,
    gameCode: null,
    trickWinner: null,
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
    stage: 'awaiting-players',
    playerId: 'abbey',
    trickLeader: null,
    activePlayer: null,
    trumpSuit: null,
    gameCode: '1234',
    trickWinner: null,
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
        { suit: 'jester' },
        { suit: 'wizard' },
        { suit: 'jester' },
        { suit: 'wizard' },
        { suit: 'jester' },
        { suit: 'wizard' },
        { suit: 'hearts', number: 1 },
        { suit: 'hearts', number: 11 },
        { suit: 'hearts', number: 7 },
        { suit: 'clubs', number: 1 },
        { suit: 'clubs', number: 3 },
        { suit: 'clubs', number: 12 },
        { suit: 'jester' },
        { suit: 'wizard' },
        { suit: 'hearts', number: 1 },
        { suit: 'hearts', number: 11 },
        { suit: 'hearts', number: 7 },
        { suit: 'clubs', number: 1 },
        { suit: 'clubs', number: 3 },
        { suit: 'clubs', number: 12 },
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
    stage: 'betting',
    playerId: 'abbey',
    trickLeader: 'abbey',
    activePlayer: null,
    trumpSuit: 'diamonds',
    gameCode: '1234',
    trickWinner: null,
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
        { suit: 'jester' },
        { suit: 'hearts', number: 1 },
        { suit: 'clubs', number: 12 },
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
    stage: 'playing',
    playerId: 'abbey',
    trickLeader: 'abbey',
    activePlayer: null,
    trumpSuit: 'diamonds',
    gameCode: '1234',
    trickWinner: null,
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
        { suit: 'jester' },
        { suit: 'clubs', number: 12 },
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
        'abbey': { suit: 'hearts', number: 1 },
        'fritz': { suit: 'hearts', number: 7 },
        'karen': { suit: 'jester' },
    },
    stage: 'playing',
    playerId: 'abbey',
    trickLeader: 'abbey',
    activePlayer: 'martin',
    trumpSuit: 'diamonds',
    gameCode: '1234',
    trickWinner: null,
}