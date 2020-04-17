export const API = process.env.REACT_APP_API as string;

export type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs' | 'wizard' | 'jester';

export interface Card {
    suit: Suit;
    number?: number | null;
}

/**
 * username of the player
 */
export type PlayerId = string;

export interface Score {
    bet?: number | null;
    taken?: number | null;
}

export interface GameState {
    /**
     * the usernames of players where index is players position
     */
    players: PlayerId[];
    /**
     * scores per round where index is roundNumber
     */
    scores: (
        Record<
            PlayerId,
            Score
        >
    )[];
    roundNumber: number;
    trickNumber: number;
    stage: 'awaiting-players' | 'betting' | 'playing' | 'trick-won';
    cards: Card[];
    trickCards: Record<PlayerId, Card | null>;
    trickWinner: PlayerId | null;
    playerId: PlayerId | null;
    trickLeader: PlayerId | null;
    activePlayer: PlayerId | null;
    trumpSuit: Suit | null;
    gameCode: string | null;
}

export interface CardPlayedParams {
    playerId: PlayerId;
    card: Card;
}

export interface RoundStartedParams {
    roundNumber: number;
    trickLeader: PlayerId;
    cards: Card[];
    trump: Suit;
}

export interface TrickStartedParams {
    roundNumber: number;
    trickNumber: number;
    trickLeader: PlayerId;
}

export interface BetPlacedParams {
    playerId: PlayerId;
    bet: number;
}

export interface RejoinGameParams extends Partial<GameState> {
    gameStarted: boolean;
}

export enum USER_EVENTS {
    CREATE_GAME = 'create-game',
    GET_PLAYERS = 'get-users',
    JOIN_GAME = 'join-game',
    PLACE_BET = 'place-bet',
    PLAY_CARD = 'play-card',
    READY_FOR_NEXT_TRICK = 'ready-for-next-trick',
    REJOIN_GAME = 'rejoin-game',
    START_GAME = 'start-game',
}

export enum SERVER_EVENTS {
    ACTIVE_PLAYER_CHANGED = 'active-user-changed',
    BET_PLACED = 'bet-placed',
    CARD_PLAYED = 'card-played',
    ERROR = 'error',
    PLAYER_READY = 'player-ready',
    PLAYERS_CHANGED = 'users-changed',
    ROUND_STARTED = 'round-started',
    TRICK_STARTED = 'trick-started',
    TRICK_WON = 'trick-won',
    TRUMP_CHANGED = 'trump-changed',
}
