import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent,
    Typography,
} from '@material-ui/core';
import isNil from 'lodash.isnil';
import { PlayerAvatar } from '../Avatar';
import { PlayerId } from '../../types';

interface TrickWonDialogProps {
    winner: PlayerId | null;
    playerNumber: number | null;
    trick: number;
    round: number;
}

function TrickWonDialog(props: TrickWonDialogProps) {
    const { 
        winner,
        playerNumber,
        round,
        trick,
    } = props;

    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setDismissed(false);
    }, [round, trick]);

    return (
        <Dialog 
            open={Boolean(winner) && !dismissed}
            onClick={() => setDismissed(true)}
        >
            <DialogContent>
                <PlayerAvatar
                    player={!isNil(playerNumber) ? playerNumber + 1 : playerNumber}
                    style={{
                        width: 120,
                        height: 120,
                        margin: 'auto',
                    }}
                />
                <Typography>{winner} has won the trick!</Typography>
            </DialogContent>
        </Dialog>
    )
}

export {
    TrickWonDialog,
}