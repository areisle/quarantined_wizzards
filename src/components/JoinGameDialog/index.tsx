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

interface JoinGameDialogProps {
    open: boolean;
    onJoin: (username: string) => void;
}

function JoinGameDialog(props: JoinGameDialogProps) {
    const { 
        open, 
        onJoin,
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
        <Dialog 
            open={open}
        >
            <DialogTitle>
                Welcome to Quaranteened Wizzards!
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