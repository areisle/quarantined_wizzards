import React from 'react';
import { 
    Button, 
    Dialog, 
    DialogActions,
    DialogTitle,
} from '@material-ui/core';

interface StartGameDialogProps {
    open: boolean;
    onStart: () => void;
}

function StartGameDialog(props: StartGameDialogProps) {
    const { 
        open, 
        onStart,
    } = props;

    return (
        <Dialog 
            open={open}
        >
            <DialogTitle>
                Welcome to Quaranteened Wizzards!
            </DialogTitle>
            <DialogActions>
                <Button
                    onClick={onStart}
                    color='primary'
                    variant='contained'
                >
                    start a new game
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export {
    StartGameDialog,
}