import './index.scss';

import React from 'react';
import { GameState, GAME_STAGE } from '../../types';
import { IconButton } from '@material-ui/core';
import { ScoreBoardIcon, SuitIcon } from '../../icons';

interface HeaderProps {
    onScoreBoardOpen: () => void;
    stage: GameState['stage'];
    roundNumber: GameState['roundNumber'];
    trickNumber: GameState['trickNumber'];
    trumpSuit: GameState['trumpSuit'];
}

function Header(props: HeaderProps) {
    const {
        onScoreBoardOpen,
        roundNumber,
        stage,
        trickNumber,
        trumpSuit,
    } = props;
    
    const isSetup = stage === GAME_STAGE.SETTING_UP;
    const isBetting = stage === GAME_STAGE.BETTING;

    return (
        <header className='game-header'>
            {!isSetup && (
                <>
                    <ul className='game-header__stats'>
                        <li>trump: {trumpSuit && (<SuitIcon variant={trumpSuit} aria-label={trumpSuit} />)}</li>
                        <li>round: {roundNumber + 1}</li>
                        <li>trick: {isBetting ? 'waiting for bets...' : trickNumber + 1}</li>
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