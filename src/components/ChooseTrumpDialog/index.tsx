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
import { SUIT } from '../../types';

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
                <Marker suit={SUIT.SPADES} />
                <Marker suit={SUIT.HEARTS} />
                <Marker suit={SUIT.DIAMONDS} />
                <Marker suit={SUIT.CLUBS} />
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