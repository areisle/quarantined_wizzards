import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';

import { GAME_STAGE, GameState } from '../../types';
import { usePrevious } from '../../utilities';
import { ScoreBoard } from '../ScoreBoard';

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
            onClose={() => setOpen(false)}
            open={open}
        >
            <DialogTitle>
                All bets have been placed!
            </DialogTitle>
            <DialogContent>
                <ScoreBoard
                    players={players}
                    roundNumber={roundNumber}
                    scores={scores}
                    stage={stage}
                    trickNumber={trickNumber}
                    variant='bet'
                />
            </DialogContent>
        </Dialog>
    );
}

export {
    AllBetsInDialog,
};
