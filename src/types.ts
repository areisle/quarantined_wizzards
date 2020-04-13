export interface Card {
    suit: 'hearts' | 'diamonds' | 'spades' | 'clubs' | 'wizard' | 'jester';
    number?: number | null;
}

type PlayerNumber = number;
type RoundNumber = number;

// for now player ids can just be numbers?
export interface GameState {
    players: string[];
    scores: Record<
        RoundNumber, 
        Record<
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

export interface CardPlayedParams {
    playerId: number;
    card: Card;
}