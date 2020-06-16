import './index.scss';

import { Button } from '@material-ui/core';
import React, {
    useCallback, useContext, useEffect, useState,
} from 'react';
import SwipeableViews from 'react-swipeable-views';

import { GameContext } from '../../Context';
import { GAME_STAGE } from '../../types';
import { PlayingCard } from '../PlayingCard';

interface PlayerDeckProps {
    onPlaceCard: (cardIndex: number) => void;
}

function PlayerDeck(props: PlayerDeckProps) {
    const { onPlaceCard } = props;
    const {
        cards,
        stage,
        playerId,
        activePlayer,
    } = useContext(GameContext);

    const [open, setOpen] = useState(false);
    const [selectedIndex, setIndex] = useState(0);
    const [animate, setAnimate] = useState(false);

    const showPlaceCard = (
        activePlayer === playerId
        && stage === GAME_STAGE.PLAYING
    );

    const handleChangeIndex = useCallback((index: number) => {
        setIndex(index);
    }, []);

    const handleOpen = useCallback((e) => {
        e.stopPropagation();
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setAnimate(false);
        setOpen(false);
    }, []);

    const handlePlaceCard = useCallback((card: number) => {
        setOpen(false);
        onPlaceCard(card);
    }, [onPlaceCard]);

    useEffect(() => {
        if (open) {
            setAnimate(true);
        }
    }, [open]);

    if (stage === GAME_STAGE.SETTING_UP) {
        return null;
    }

    const playingCards = cards.map((card, index) => (
        <PlayingCard
            key={index}
            {...card}
            onClick={(e) => {
                setIndex(index);
                if (open) {
                    e.stopPropagation();
                }
            }}
            selected={index === selectedIndex && open}
        />
    ));

    const swipeableCards = cards.map((card, index) => (
        <div
            key={index}
            className='card-preview__wrapper'
        >
            <PlayingCard
                {...card}
                onClick={(e) => e.stopPropagation()}
                size='large'
            >
                {showPlaceCard && (
                    <Button
                        color='primary'
                        onClick={() => handlePlaceCard(index)}
                        variant='contained'
                    >
                        Place Card
                    </Button>
                )}
            </PlayingCard>
        </div>
    ));

    return (
        <div
            className={`playing-cards-deck playing-cards-deck--${open ? 'open' : 'closed'}`}
            id='playing-cards-deck'
            onClick={handleClose}
            role='presentation'
        >
            <div className='playing-cards-deck__card-preview'>
                <SwipeableViews
                    animateTransitions={animate}
                    index={selectedIndex}
                    onChangeIndex={handleChangeIndex}
                >
                    {swipeableCards}
                </SwipeableViews>
            </div>
            <div
                className='playing-cards-deck__list'
                onClick={handleOpen}
                role='presentation'
            >
                {playingCards}
            </div>
        </div>
    );
}

export {
    PlayerDeck,
};
