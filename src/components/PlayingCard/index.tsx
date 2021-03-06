import './index.scss';

import React, { HTMLProps } from 'react';

import { Card, SUIT } from '../../types';
import { SuitIcon } from '../icons';

export interface PlayingCardProps extends Card {
    /**
     * how big the card should be
     * @default medium
     */
    size?: 'medium' | 'large' | 'flexible';
    /**
     * whether the card is currently selected
     * @default false
     */
    selected?: boolean;
    onClick?: HTMLProps<HTMLDivElement>['onClick'];
    children?: HTMLProps<HTMLDivElement>['children'];
}

function Marker(props: Card) {
    const { suit, number = null } = props;

    let displayNumber: number | string | null = number;

    if (number === 11) {
        displayNumber = 'J';
    } else if (number === 12) {
        displayNumber = 'Q';
    } else if (displayNumber === 13) {
        displayNumber = 'K';
    } else if (displayNumber === 1) {
        displayNumber = 'A';
    }

    return (
        <div className='marker'>
            <SuitIcon
                variant={suit as SUIT}
            />
            {displayNumber}
        </div>
    );
}

function PlayingCard(props: PlayingCardProps) {
    const {
        size = 'medium',
        suit,
        number,
        selected,
        children,
        ...rest
    } = props;

    return (
        <div
            {...rest}
            className={`playing-card playing-card--${size} ${selected ? 'playing-card--selected' : ''}`}
        >
            <Marker number={number} suit={suit} />
            <div className='playing-card__content'>
                {children}
            </div>
            <Marker number={number} suit={suit} />
        </div>
    );
}

export {
    PlayingCard,
    Marker,
};
