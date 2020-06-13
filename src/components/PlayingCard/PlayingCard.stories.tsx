import React from 'react';
import { PlayingCard, PlayingCardProps } from '.';
import { SUIT } from '../../types';
import { TrophyIcon } from '../icons';

export default {
    component: PlayingCard,
    title: 'PlayingCard',
    args: {
        suit: SUIT.DIAMONDS,
        number: 7,
    }
}

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
        size={'large'}
   />
);

export const FlexibleSize = (props: PlayingCardProps) => (
   <PlayingCard
        {...props}
        size={'flexible'}
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
        suit={SUIT.WIZARD}
        number={null}
   />
);

export const Jester = (props: PlayingCardProps) => (
   <PlayingCard
        {...props}
        suit={SUIT.JESTER}
        number={null}
   />
);

export const Ace = (props: PlayingCardProps) => (
   <PlayingCard
        {...props}
        suit={SUIT.SPADES}
        number={1}
   />
);

export const King = (props: PlayingCardProps) => (
   <PlayingCard
        {...props}
        suit={SUIT.HEARTS}
        number={13}
   />
);

export const Queen = (props: PlayingCardProps) => (
   <PlayingCard
        {...props}
        suit={SUIT.CLUBS}
        number={12}
   />
);

export const Jack = (props: PlayingCardProps) => (
   <PlayingCard
        {...props}
        suit={SUIT.DIAMONDS}
        number={11}
   />
);
