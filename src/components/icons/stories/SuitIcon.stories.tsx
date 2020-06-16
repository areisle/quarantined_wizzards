import React from 'react';

import { SuitIcon, SuitIconProps } from '..';
import { SUIT } from '../../../types';

export default {
    component: SuitIcon,
    title: 'icons/SuitIcon',
};

export const Spades = (props: SuitIconProps) => (
    <SuitIcon
        {...props}
    />
);

Spades.args = {
    variant: SUIT.SPADES,
};

export const Wizard = (props: SuitIconProps) => (
    <SuitIcon
        {...props}
        variant={SUIT.WIZARD}
    />
);

export const Jester = (props: SuitIconProps) => (
    <SuitIcon
        {...props}
        variant={SUIT.JESTER}
    />
);

export const Diamonds = (props: SuitIconProps) => (
    <SuitIcon
        {...props}
        variant={SUIT.DIAMONDS}
    />
);

export const Clubs = (props: SuitIconProps) => (
    <SuitIcon
        {...props}
        variant={SUIT.CLUBS}
    />
);

export const Hearts = (props: SuitIconProps) => (
    <SuitIcon
        {...props}
        variant={SUIT.HEARTS}
    />
);
