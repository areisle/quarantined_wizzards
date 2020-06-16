import './index.scss';

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@material-ui/core';
import React, { useMemo } from 'react';

import { GameState, PlayerId } from '../../types';
import { getGameWinners } from '../../utilities';
import { PlayerAvatar } from '../Avatar';
import { TrophyIcon } from '../icons';
import { GameStateDialogProps } from '../useGameStateDialog';

export interface GameCompleteDialogProps extends GameStateDialogProps {
    players: PlayerId[];
    scores: GameState['scores'];
}

function GameCompleteDialog(props: GameCompleteDialogProps) {
    const {
        players,
        scores,
        ...rest
    } = props;

    const winners = useMemo(() => getGameWinners(players, scores), [players, scores]);

    return (
        <Dialog {...rest}>
            <DialogTitle>Game is complete!</DialogTitle>
            <DialogContent>
                <div className='game-complete-dialog__podium'>
                    <div className='podium podium--first'>
                        <PlayerAvatar
                            player={winners.first + 1}
                        >
                            <TrophyIcon variant='gold' />

                        </PlayerAvatar>
                        <div className='podium__block'>
                            {players[winners.first]}
                        </div>
                    </div>
                    <div className='podium podium--second'>
                        <PlayerAvatar
                            player={winners.second + 1}
                        >
                            <TrophyIcon variant='silver' />

                        </PlayerAvatar>
                        <div className='podium__block'>
                            {players[winners.second]}
                        </div>
                    </div>
                    <div className='podium podium--third'>
                        <PlayerAvatar
                            player={winners.third + 1}
                        >
                            <TrophyIcon variant='bronze' />

                        </PlayerAvatar>
                        <div className='podium__block'>
                            {players[winners.third]}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export {
    GameCompleteDialog,
};
