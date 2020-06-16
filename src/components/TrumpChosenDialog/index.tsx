import './index.scss';

import {
    Dialog,
    DialogContent,
    DialogProps,
    DialogTitle,
} from '@material-ui/core';
import React from 'react';

import { SUIT } from '../../types';
import { SuitIcon } from '../icons';
import { PlayingCard } from '../PlayingCard';
import { GameStateDialogProps } from '../useGameStateDialog';

export interface TrumpChosenDialogProps extends GameStateDialogProps, Omit<DialogProps, 'onClose'> {
    trumpSuit: SUIT | null;
}

function TrumpChosenDialog(props: TrumpChosenDialogProps) {
    const {
        trumpSuit,
        ...rest
    } = props;

    return (
        <Dialog
            {...rest}
            className='trump-chosen-dialog'
        >
            <DialogTitle>
                A new trump suit has been chosen
            </DialogTitle>
            <DialogContent>
                {trumpSuit && (
                    <PlayingCard
                        suit={trumpSuit}
                    >
                        <div className='trump-chosen-dialog__icon-wrapper'>

                            <SuitIcon
                                variant={trumpSuit}
                            />
                        </div>
                    </PlayingCard>
                )}
            </DialogContent>
        </Dialog>
    );
}

export {
    TrumpChosenDialog,
};
