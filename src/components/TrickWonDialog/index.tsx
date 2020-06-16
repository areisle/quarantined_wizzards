import {
    Dialog,
    DialogContent,
    DialogTitle,
    Typography,
} from '@material-ui/core';
import isNil from 'lodash.isnil';
import React from 'react';

import { GAME_STAGE, GameState, PlayerId } from '../../types';
import { PlayerAvatar } from '../Avatar';
import { TrophyIcon } from '../icons';
import { ScoreBoard } from '../ScoreBoard';
import { GameStateDialogProps } from '../useGameStateDialog';

export interface TrickWonDialogProps extends GameStateDialogProps {
    winner: PlayerId | null;
    playerNumber: number | null;
    trick: number;
    round: number;
    players: PlayerId[];
    scores: GameState['scores'];
}

function TrickWonDialog(props: TrickWonDialogProps) {
    const {
        winner,
        playerNumber,
        round,
        trick,
        players,
        scores,
        ...rest
    } = props;

    const roundComplete = trick === round;

    return (
        <Dialog
            {...rest}
        >
            {(roundComplete) && (
                <DialogTitle>
                    Round
                    {' '}
                    {round + 1}
                    {' '}
                    is complete!
                </DialogTitle>
            )}
            <DialogContent>
                <PlayerAvatar
                    player={!isNil(playerNumber) ? playerNumber + 1 : playerNumber}
                    style={{
                        width: 200,
                        height: 200,
                        margin: '0 auto',
                    }}
                >
                    <TrophyIcon />
                </PlayerAvatar>
                <Typography align='center'>
                    {winner}
                    {' '}
                    has won the trick!
                </Typography>
                {(roundComplete) && (
                    <ScoreBoard
                        players={players}
                        roundNumber={round}
                        scores={scores}
                        stage={GAME_STAGE.BETWEEN_TRICKS}
                        trickNumber={trick}
                        variant='round'
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

export {
    TrickWonDialog,
};
