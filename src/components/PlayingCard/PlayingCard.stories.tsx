import React from 'react';

import { SUIT } from '../../types';
import { TrophyIcon } from '../icons';
import { PlayingCard, PlayingCardProps } from '.';

export default {
    component: PlayingCard,
    title: 'PlayingCard',
    args: {
        suit: SUIT.DIAMONDS,
        number: 7,
    },
};

export const Example = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
    />
);

export const Selected = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        selected={true}
    />
);

export const Large = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        size='large'
    />
);

export const FlexibleSize = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        size='flexible'
    />
);

export const WithContent = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
    >
        <TrophyIcon />
    </PlayingCard>
);

export const Wizard = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        number={null}
        suit={SUIT.WIZARD}
    />
);

export const Jester = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        number={null}
        suit={SUIT.JESTER}
    />
);

export const Ace = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        number={1}
        suit={SUIT.SPADES}
    />
);

export const King = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        number={13}
        suit={SUIT.HEARTS}
    />
);

export const Queen = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        number={12}
        suit={SUIT.CLUBS}
    />
);

export const Jack = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        number={11}
        suit={SUIT.DIAMONDS}
    />
);
