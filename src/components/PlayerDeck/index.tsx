import './index.scss';

import React, { useState, useCallback, useEffect } from 'react';
import { PlayingCard } from '../PlayingCard';
import SwipeableViews from 'react-swipeable-views';
import { Button } from '@material-ui/core';
import { GAME_STAGE, GameState } from '../../types';

export interface PlayerDeckProps {
    onPlaceCard?: (cardIndex: number) => void;
    onOpen?: () => void;
    onClose?: () => void;
    /**
     * whether the deck is open or not
     * @default false
     */
    open?: boolean;
    cards: GameState['cards'];
    stage: GameState['stage'];
    playerId: GameState['playerId'];
    activePlayer: GameState['activePlayer'];
}

function PlayerDeck(props: PlayerDeckProps) {
    const {
        onPlaceCard,
        cards,
        stage,
        playerId,
        activePlayer,
        onOpen,
        onClose,
        open,
    } = props;

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
        onOpen?.();
    }, [onOpen]);

    const handleClose = useCallback(() => {
        setAnimate(false);
        onClose?.();
    }, [onClose]);

    const handlePlaceCard = useCallback((card: number) => {
        onClose?.();
        onPlaceCard?.(card);
    }, [onClose, onPlaceCard]);

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
            selected={index === selectedIndex && open}
            onClick={(e) => {
                setIndex(index);
                if (open) {
                    e.stopPropagation();
                }
            }}
        />
    ));

    const swipeableCards = cards.map((card, index) => {
        return (
            <div
                key={index}
                className='card-preview__wrapper'
            >
                <PlayingCard
                    {...card}
                    size='large'
                    onClick={(e) => e.stopPropagation()}
                >
                    {showPlaceCard && (
                        <Button
                            onClick={() => handlePlaceCard(index)}
                            variant='contained'
                            color='primary'
                        >
                            Place Card
                        </Button>
                    )}
                </PlayingCard>
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
                        animateTransitions={animate}
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
