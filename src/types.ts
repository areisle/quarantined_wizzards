export const API = process.env.REACT_APP_API as string;

export enum SUIT {
    HEARTS = 'hearts',
    DIAMONDS = 'diamonds',
    SPADES = 'spades',
    CLUBS = 'clubs',
    WIZARD = 'wizard',
    JESTER = 'jester',
}

export interface Card {
    suit: SUIT;
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

export enum GAME_STAGE {
    SETTING_UP = 'awaiting-players',
    BETTING = 'betting',
    PLAYING = 'playing',
    BETWEEN_TRICKS = 'trick-won',
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
    stage: GAME_STAGE;
    cards: Card[];
    trickCards: Record<PlayerId, Card | null>;
    ready: Record<PlayerId, boolean | null>;
    trickWinner: PlayerId | null;
    playerId: PlayerId | null;
    trickLeader: PlayerId | null;
    activePlayer: PlayerId | null;
    trumpSuit: SUIT | null;
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
    trump: SUIT;
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

export type RejoinGameParams = Partial<GameState>;

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
