import './index.scss';

import React, { HTMLProps } from 'react';
import { Card, Suit } from '../../types';
import { SuitIcon } from '../../icons';
import { Typography } from '@material-ui/core';

interface PlayingCardProps extends Partial<Card> {
    size?: 'medium' | 'large' | 'flexible';
    selected?: boolean;
    onClick?: HTMLProps<HTMLDivElement>['onClick'];
    children?: HTMLProps<HTMLDivElement>['children'];
}

function Marker(props: Partial<Card>) {
    const { suit, number } = props;
    return (
        <div className={`marker marker--${suit}`}>
            <SuitIcon
                variant={suit as Suit}
            />
            <Typography>{number}</Typography>
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
