import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@material-ui/core';
import { RoundScoreBoard } from '../ScoreBoard';
import { GameState, GAME_STAGE } from '../../types';
import { usePrevious } from '../../utilities';

type AllBetsInDialogProps = Pick<GameState, 'scores' | 'players' | 'stage' | 'roundNumber' | 'trickNumber'>;

function AllBetsInDialog(props: AllBetsInDialogProps) {
    const {
        scores,
        players,
        stage,
        roundNumber,
        trickNumber,
    } = props;
    
    const prevStage = usePrevious(stage);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (prevStage === GAME_STAGE.BETTING && stage === GAME_STAGE.PLAYING && trickNumber === 0) {
            setOpen(true);
        }
    }, [prevStage, stage, trickNumber]);

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
        >
            <DialogTitle>
                All bets have been placed!
            </DialogTitle>
            <DialogContent>
                <RoundScoreBoard
                    scores={scores}
                    roundNumber={roundNumber}
                    players={players}
                    stage={stage}
                    trickNumber={trickNumber}
                    variant='bet'
                />
            </DialogContent>
        </Dialog>
    )
}

export {
    AllBetsInDialog,
}