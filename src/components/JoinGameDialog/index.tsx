import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    TextFieldProps,
} from '@material-ui/core';
import { GameStateDialogProps } from '../useGameStateDialog';

export interface JoinGameDialogProps extends GameStateDialogProps {
    onJoin: (username: string) => void;
}

function JoinGameDialog(props: JoinGameDialogProps) {
    const {
        onJoin,
        ...rest
    } = props;
    const [username, setUsername] = useState<string | null>(null);

    const handleChange: TextFieldProps['onChange'] = (e) => {
        const value = e.target.value;
        setUsername(value || null);
    }

    const handleBetPlaced = () => {
        onJoin(username as string);
    }

    return (
        <Dialog {...rest}>
            <DialogTitle>
                Welcome to Quarantined Wizzards!
            </DialogTitle>
            <DialogContent>
                <TextField
                    value={username || ''}
                    label='Enter a username for your player'
                    onChange={handleChange}
                    id='username'
                    aria-label='username'
                    fullWidth={true}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={!username}
                    onClick={handleBetPlaced}
                    color='primary'
                    variant='contained'
                >
                    Join game
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export {
    JoinGameDialog,
}
