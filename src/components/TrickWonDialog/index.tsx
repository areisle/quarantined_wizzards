import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent,
    Typography,
    DialogTitle,
} from '@material-ui/core';
import isNil from 'lodash.isnil';
import { PlayerAvatar } from '../Avatar';
import { PlayerId, GameState, GAME_STAGE } from '../../types';
import { ScoreBoard } from '../ScoreBoard';
import { TrophyIcon } from '../icons';

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
            open={Boolean(winner) && !dismissed}
            onClick={() => setDismissed(true)}
        >
            {(roundComplete) && (
                <DialogTitle>Round {round + 1} is complete!</DialogTitle>
            )}
            <DialogContent>
                <PlayerAvatar
                    player={!isNil(playerNumber) ? playerNumber + 1 : playerNumber}
                    style={{
                        width: 200,
                        height: 200,
                        margin: '0 auto'
                    }}
                >
                    <TrophyIcon />
                </PlayerAvatar>
                <Typography align='center'>{winner} has won the trick!</Typography>
                {(roundComplete) && (
                    <ScoreBoard
                        scores={scores}
                        players={players}
                        roundNumber={round}
                        trickNumber={trick}
                        stage={GAME_STAGE.BETWEEN_TRICKS}
                        variant='round'
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

export {
    TrickWonDialog,
}