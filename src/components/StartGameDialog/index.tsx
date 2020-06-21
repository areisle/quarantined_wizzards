import './index.scss';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    TextFieldProps,
} from '@material-ui/core';
import React, { useCallback, useState } from 'react';

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
        let gameCode = event?.target?.value;
        try {
            const url = new URL(gameCode);
            if (url.searchParams.get('game')) {
                gameCode = url.searchParams.get('game') as string;
            }
        } catch (err) {
            // pass
        }
        setGameId(gameCode);
    };

    const handleJoinGame = useCallback(() => {
        onStart(gameId);
    }, [onStart, gameId]);

    const [isJoining, setIsJoining] = useState(false);

    return (
        <Dialog
            className='start-join-game'
            open={open}
        >
            <DialogTitle>
                Welcome to Quarantined Wizzards!
            </DialogTitle>
            <DialogContent>
                {isJoining && (
                    <TextField
                        fullWidth={true}
                        label='Enter a URL or game ID'
                        onChange={handleGameIdChange}
                    />
                )}
            </DialogContent>
            <DialogActions className='start-join-game__actions'>
                {!isJoining && (
                    <Button onClick={() => setIsJoining(true)}>join existing game</Button>
                )}
                {isJoining && (
                    <Button onClick={() => setIsJoining(false)}>back</Button>
                )}
                <Button
                    color='primary'
                    onClick={handleJoinGame}
                    variant='contained'
                >
                    {isJoining
                        ? 'join game'
                        : 'start a new game'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export {
    StartGameDialog,
};
