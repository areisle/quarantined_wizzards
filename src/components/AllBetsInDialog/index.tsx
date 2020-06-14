import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@material-ui/core';
import { ScoreBoard } from '../ScoreBoard';
import { GameState } from '../../types';
import { GameStateDialogProps } from '../useGameStateDialog';

export type AllBetsInDialogProps = Pick<GameState, 'scores' | 'players' | 'stage' | 'roundNumber' | 'trickNumber'> & GameStateDialogProps;

function AllBetsInDialog(props: AllBetsInDialogProps) {
    const {
        scores,
        players,
        stage,
        roundNumber,
        trickNumber,
        ...rest
    } = props;

    return (
        <Dialog {...rest}>
            <DialogTitle>
                All bets have been placed!
            </DialogTitle>
            <DialogContent>
                <ScoreBoard
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
