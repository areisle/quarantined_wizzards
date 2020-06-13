import './index.scss';

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Dialog, 
    DialogContent,
    DialogTitle,
} from '@material-ui/core';
import { PlayerAvatar } from '../Avatar';
import { PlayerId, GameState, GAME_STAGE } from '../../types';
import { TrophyIcon } from '../icons';
import { getGameWinners } from '../../utilities';

interface GameCompleteDialogProps {
    players: PlayerId[];
    scores: GameState['scores'];
    stage: GAME_STAGE;
}

function GameCompleteDialog(props: GameCompleteDialogProps) {
    const { 
        players,
        scores,
        stage,
    } = props;

    const [dismissed, setDismissed] = useState(false);

    const winners = useMemo(() => getGameWinners(players, scores), [players, scores])

    const gameComplete = stage === GAME_STAGE.COMPLETE;

    useEffect(() => {
        setDismissed(false);
    }, [stage]);

    return (
        <Dialog 
            open={gameComplete && !dismissed}
            onClick={() => setDismissed(true)}
        >
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
    )
}

export {
    GameCompleteDialog,
}