export interface Card {
    suit: 'hearts' | 'diamonds' | 'spades' | 'clubs' | 'wizard' | 'jester';
    number?: number | null;
}

/**
 * username of the player
 */
export type PlayerId = string;

interface Score {
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
    trumpSuit: Card['suit'] | null;
    gameCode: string | null;
}

export interface CardPlayedParams {
    playerId: PlayerId;
    card: Card;
}