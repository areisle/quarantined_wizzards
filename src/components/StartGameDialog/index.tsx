import './index.scss';

import React, { useState, useCallback } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    TextField,
    TextFieldProps,
    DialogContent,
} from '@material-ui/core';

interface StartGameDialogProps {
    open: boolean;
    onStart: (newGameId: string) => void;
}

function StartGameDialog(props: StartGameDialogProps) {
    const { 
        open, 
        onStart,
    } = props;

    const [gameId, setGameId] = useState('');

    const handleGameIdChange: TextFieldProps['onChange'] = (event) => {
        setGameId(event?.target?.value);
    };

    const handleJoinGame = useCallback(() => {
        onStart(gameId);
    }, [onStart, gameId]);

    const [isJoining, setIsJoining] = useState(false);

    return (
        <Dialog 
            open={open}
            className="start-join-game"
        >
            <DialogTitle>
                Welcome to Quarantined Wizzards!
            </DialogTitle>
            <DialogContent>
                {isJoining && (<TextField
                    onChange={handleGameIdChange}
                    label="enter a game ID"
                    fullWidth
                />)}
            </DialogContent>
            <DialogActions className="start-join-game__actions">
                {!isJoining && (
                    <Button onClick={() => setIsJoining(true)}>join existing game</Button>
                )}
                {isJoining && (
                    <Button onClick={() => setIsJoining(false)}>back</Button>
                )}
                <Button
                    onClick={handleJoinGame}
                    color='primary'
                    variant='contained'
                >
                    {isJoining
                        ? "join game"
                        : "start a new game"
                    }
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export {
    StartGameDialog,
}