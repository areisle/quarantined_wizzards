import React from 'react';
import { TrickWonDialog, TrickWonDialogProps } from '.';
import { dialogDecoratorArgs, DialogDecorator } from '../../decorators';

export default {
    component: TrickWonDialog,
    decorators: [DialogDecorator],
    title: 'dialogs/TrickWonDialog',
}

export const Basic = (props: TrickWonDialogProps) => (
    <TrickWonDialog
        {...props}
        {...dialogDecoratorArgs}
    />
);

Basic.args = {
    open: true,
    playerNumber: 2,
    winner: 'nreisle',
    trick: 0,
    round: 0,
    scores: [
        {
            areisle: { bet: 0, taken: 1 },
            creisle: { bet: 1, taken: 0 },
            nreisle: { bet: 0, taken: 0 },
        }
    ],
    players: ['areisle', 'creisle', 'nreisle'],
}
