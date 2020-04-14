import './index.scss';

import React from 'react';
import { 
    Button, 
    Dialog, 
    DialogActions,
    DialogTitle,
    DialogContent,
} from '@material-ui/core';
import { Marker } from '../PlayingCard';

interface ChooseTrumpDialogProps {
    open: boolean;
    onStart: () => void;
}

function ChooseTrumpDialog(props: ChooseTrumpDialogProps) {
    const {
        open, 
        onStart,
    } = props;

    return (
        <Dialog 
            open={open}
        >
            <DialogTitle>
                Select which suit you would like to be trump
            </DialogTitle>
            <DialogContent className='trump-selector'>
                <Marker suit='spades'/>
                <Marker suit='hearts'/>
                <Marker suit='diamonds'/>
                <Marker suit='clubs'/>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onStart}
                    color='primary'
                    variant='contained'
                >
                    Select Suit
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export {
    ChooseTrumpDialog,
}