import './index.scss';

import React, { useState, useCallback } from 'react';
import { PlayingCard, MarkerProps } from '../PlayingCard';
import SwipeableViews from 'react-swipeable-views';

interface PlayerDeckProps {
    cards: MarkerProps[];
}

function PlayerDeck(props: PlayerDeckProps) {
    const { cards } = props;
    const [open, setOpen] = useState(false);
    const [selectedIndex, setIndex] = useState(0);

    const handleChangeIndex = useCallback((index: number) => {
        setIndex(index);
    }, []);

    const handleOpen = useCallback((e) => {
        e.stopPropagation();
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const playingCards = cards.map((card, index) => (
        <PlayingCard 
            key={index} 
            {...card} 
            selected={index === selectedIndex && open} 
            onClick={(e) => {
                if (open) {
                    e.stopPropagation();
                    setIndex(index);
                }
            }}
        />
    ));

    const swipeableCards = cards.map((card, index) => {
        return (
            <div className='card-preview__wrapper'>
                <PlayingCard
                    key={index}
                    {...card}
                    size='large'
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        )
    });

    return (
        <div 
            id='playing-cards-deck'
            className={`playing-cards-deck playing-cards-deck--${open ? 'open' : 'closed'}`}
            onClick={handleClose}
        >
                <div className='playing-cards-deck__card-preview'>
                    <SwipeableViews 
                        index={selectedIndex}
                        onChangeIndex={handleChangeIndex}
                    >
                        {swipeableCards}
                    </SwipeableViews>
                </div>
            <div
                className='playing-cards-deck__list'
                onClick={handleOpen}
            >
                {playingCards}
            </div>
        </div>
    )
}

export {
    PlayerDeck
}