import './index.scss';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@material-ui/core';
import React from 'react';

import { SUIT } from '../../types';
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
                <Marker suit={SUIT.SPADES} />
                <Marker suit={SUIT.HEARTS} />
                <Marker suit={SUIT.DIAMONDS} />
                <Marker suit={SUIT.CLUBS} />
            </DialogContent>
            <DialogActions>
                <Button
                    color='primary'
                    onClick={onStart}
                    variant='contained'
                >
                    Select Suit
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export {
    ChooseTrumpDialog,
};
