import './index.scss';

import React, { HTMLProps } from 'react';
import { Card } from '../../types';

interface PlayingCardProps extends Partial<Card> {
    size?: 'medium' | 'large' | 'flexible';
    selected?: boolean;
    onClick?: HTMLProps<HTMLDivElement>['onClick'];
    children?: HTMLProps<HTMLDivElement>['children'];
}

function Marker(props: Partial<Card>) {
    const { suit, number } = props;
    const letter = suit?.charAt(0).toUpperCase();
    return (
        <div className={`marker marker--${suit}`}>
            {letter}{number}
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
