import './index.scss';

import React from 'react';
import { Card, GameState } from '../../types';
import { IconButton } from '@material-ui/core';
import { ScoreBoardIcon } from '../../icons';

const cardToString = (card: Card | null) => card && (card.number ? `${card.number} of ${card.suit}` : card.suit);

interface HeaderProps {
    onScoreBoardOpen: () => void;
    stage: GameState['stage'];
    round: GameState['roundNumber'];
    trick: GameState['trickNumber'];
    trump: GameState['trumpCard'];
}

function Header(props: HeaderProps) {
    const {
        onScoreBoardOpen,
        round,
        stage,
        trick,
        trump,
    } = props;
    
    const isSetup = stage === 'awaiting-players';
    const isBetting = stage === 'betting';

    return (
        <header className='game-header'>
            {!isSetup && (
                <>
                    <ul className='game-header__stats'>
                        <li>trump: {cardToString(trump)}</li>
                        <li>round: {round + 1}</li>
                        <li>trick: {isBetting ? 'waiting for bets...' : trick + 1}</li>
                    </ul>
                    <IconButton
                        size='small'
                        onClick={onScoreBoardOpen}
                    >
                        <ScoreBoardIcon
                            fontSize='large'
                        />
                    </IconButton>
                </>
            )}
        </header>
    )
}

export {
    Header,
}