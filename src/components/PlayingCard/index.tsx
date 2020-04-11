import './index.scss';

import React, { HTMLProps } from 'react';

export interface MarkerProps {
    suit?: 'heart' | 'diamond' | 'spade' | 'club' | null;
    number?: number | null;
    special?: 'wizard' | 'jester' | null;
}

interface PlayingCardProps extends MarkerProps {
    size?: 'medium' | 'large';
    selected?: boolean;
    onClick?: HTMLProps<HTMLDivElement>['onClick'];
    children?: HTMLProps<HTMLDivElement>['children'];
}

function Marker(props: MarkerProps) {
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
