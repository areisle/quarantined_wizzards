import './index.scss';

import { IconButton } from '@material-ui/core';
import React from 'react';

import { GAME_STAGE, GameState } from '../../types';
import { ScoreBoardIcon, SuitIcon } from '../icons';

export interface HeaderProps {
    onScoreBoardOpen: () => void;
    stage: GameState['stage'];
    roundNumber: GameState['roundNumber'];
    trickNumber: GameState['trickNumber'];
    trumpSuit: GameState['trumpSuit'];
    totalRounds: number,
}

function Header(props: HeaderProps) {
    const {
        onScoreBoardOpen,
        roundNumber,
        stage,
        trickNumber,
        trumpSuit,
        totalRounds,
    } = props;

    const isSetup = stage === GAME_STAGE.SETTING_UP;
    const isBetting = stage === GAME_STAGE.BETTING;

    return (
        <header className='game-header'>
            {!isSetup && (
                <>
                    <ul className='game-header__stats'>
                        <li>
                            trump:
                            {' '}
                            {trumpSuit && (<SuitIcon aria-label={trumpSuit} variant={trumpSuit} />)}
                        </li>
                        <li>
                            round:
                            {' '}
                            {roundNumber + 1}
                            {' '}
                            /
                            {' '}
                            {totalRounds}
                        </li>
                        <li>
                            trick:
                            {' '}
                            {isBetting ? 'waiting for bets...' : trickNumber + 1}
                        </li>
                    </ul>
                    <IconButton
                        onClick={onScoreBoardOpen}
                        size='small'
                    >
                        <ScoreBoardIcon
                            fontSize='large'
                        />
                    </IconButton>
                </>
            )}
        </header>
    );
}

export {
    Header,
};
