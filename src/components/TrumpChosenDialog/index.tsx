import './index.scss';

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';

import { GAME_STAGE, SUIT } from '../../types';
import { usePrevious } from '../../utilities';
import { SuitIcon } from '../icons';
import { PlayingCard } from '../PlayingCard';

interface TrumpChosenDialogProps {
    trumpSuit: SUIT | null;
    stage: GAME_STAGE;
}

function TrumpChosenDialog(props: TrumpChosenDialogProps) {
    const {
        trumpSuit,
        stage,
    } = props;

    const prevTrump = usePrevious(trumpSuit);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open && trumpSuit !== prevTrump && stage === GAME_STAGE.BETTING) {
            setOpen(true);
        }
    }, [open, prevTrump, stage, trumpSuit]);

    return (
        <Dialog
            className='trump-chosen-dialog'
            onClose={() => setOpen(false)}
            open={open}
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
