import './index.scss';

import React, { HTMLProps } from 'react';
import { Card } from '../../Context';

interface PlayingCardProps extends Card {
    size?: 'medium' | 'large' | 'flexible';
    selected?: boolean;
    onClick?: HTMLProps<HTMLDivElement>['onClick'];
    children?: HTMLProps<HTMLDivElement>['children'];
}

function Marker(props: Card) {
    const { suit, number, special } = props;
    const letter = (suit || special)?.charAt(0).toUpperCase();
    return (
        <div className={`marker marker--${special || suit}`}>
            {letter}{number}
        </div>
    )
}

function PlayingCard(props: PlayingCardProps) {
    const { 
        size = 'medium',
        suit, 
        number, 
        special, 
        selected, 
        ...rest
    } = props;
    
    return (
        <div
            {...rest}
            className={`playing-card playing-card--${size} ${selected ? 'playing-card--selected' : ''}`}
        >
            <Marker suit={suit} number={number} special={special} />
            <Marker suit={suit} number={number} special={special} />
        </div>
    )
}

export {
    PlayingCard,
}
