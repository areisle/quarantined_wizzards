import {
    Dialog,
    DialogContent,
    DialogTitle,
    Typography,
} from '@material-ui/core';
import isNil from 'lodash.isnil';
import React, { useEffect, useState } from 'react';

import { GAME_STAGE, GameState, PlayerId } from '../../types';
import { PlayerAvatar } from '../Avatar';
import { TrophyIcon } from '../icons';
import { ScoreBoard } from '../ScoreBoard';

interface TrickWonDialogProps {
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
    } = props;

    const [dismissed, setDismissed] = useState(false);

    const roundComplete = trick === round;

    useEffect(() => {
        setDismissed(false);
    }, [round, trick]);

    return (
        <Dialog
            onClick={() => setDismissed(true)}
            open={Boolean(winner) && !dismissed}
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
