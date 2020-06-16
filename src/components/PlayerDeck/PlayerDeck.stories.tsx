import React from 'react';

import { GAME_STAGE, SUIT } from '../../types';
import { PlayerDeck, PlayerDeckProps } from '.';

const PlayerNumberDecorator = (storyFn: any) => (
    <div
        className='main--player-1'
        style={{
            position: 'relative',
            height: '100vh',
        }}
    >
        {storyFn()}
    </div>
);

const cards = [
    { suit: SUIT.HEARTS, number: 3 },
    { suit: SUIT.HEARTS, number: 8 },
    { suit: SUIT.HEARTS, number: 1 },
    { suit: SUIT.DIAMONDS, number: 8 },
    { suit: SUIT.DIAMONDS, number: 9 },
    { suit: SUIT.DIAMONDS, number: 10 },
    { suit: SUIT.DIAMONDS, number: 13 },
    { suit: SUIT.CLUBS, number: 2 },
    { suit: SUIT.CLUBS, number: 4 },
    { suit: SUIT.CLUBS, number: 5 },
    { suit: SUIT.CLUBS, number: 11 },
    { suit: SUIT.CLUBS, number: 12 },
    { suit: SUIT.SPADES, number: 5 },
    { suit: SUIT.SPADES, number: 6 },
    { suit: SUIT.SPADES, number: 10 },
    { suit: SUIT.WIZARD },
    { suit: SUIT.JESTER },
];

export default {
    component: PlayerDeck,
    title: 'PlayerDeck',
    decorators: [PlayerNumberDecorator],
};

export const ClosedWithOneCard = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
    />
);

ClosedWithOneCard.args = {
    cards: cards.slice(0, 1),
};

export const OpenWithOneCard = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
        cards={cards.slice(0, 1)}
        open={true}
    />
);

export const ClosedWithNoCards = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
        cards={[]}
    />
);

export const ClosedWithManyCards = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
        cards={cards}
    />
);

export const OpenWithManyCards = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
        cards={cards}
        open={true}
    />
);

export const OpenAsActivePlayer = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
        activePlayer='areisle'
        cards={cards}
        open={true}
        playerId='areisle'
        stage={GAME_STAGE.PLAYING}
    />
);
