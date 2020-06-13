import './index.scss';

import React, { HTMLProps } from 'react';
import { Card, SUIT } from '../../types';
import { SuitIcon } from '../icons';

interface PlayingCardProps extends Card {
    size?: 'medium' | 'large' | 'flexible';
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
    )
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
            <Marker suit={suit} number={number} />
            <div className='playing-card__content'>
                {children}
            </div>
            <Marker suit={suit} number={number} />
        </div>
    )
}

export {
    PlayingCard,
    Marker,
}
