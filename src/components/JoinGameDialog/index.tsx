import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    TextFieldProps,
} from '@material-ui/core';
import React, { useState } from 'react';

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
        const { value } = e.target;
        setUsername(value || null);
    };

    const handleBetPlaced = () => {
        onJoin(username as string);
    };

    return (
        <Dialog {...rest}>
            <DialogTitle>
                Welcome to Quarantined Wizzards!
            </DialogTitle>
            <DialogContent>
                <TextField
                    aria-label='username'
                    fullWidth={true}
                    id='username'
                    label='Enter a username for your player'
                    onChange={handleChange}
                    value={username || ''}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color='primary'
                    disabled={!username}
                    onClick={handleBetPlaced}
                    variant='contained'
                >
                    Join game
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export {
    JoinGameDialog,
};
