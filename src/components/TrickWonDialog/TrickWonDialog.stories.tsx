import React from 'react';

import { DialogDecorator, dialogDecoratorArgs } from '../../decorators';
import { TrickWonDialog, TrickWonDialogProps } from '.';

export default {
    component: TrickWonDialog,
    decorators: [DialogDecorator],
    title: 'dialogs/TrickWonDialog',
};

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
        },
    ],
    players: ['areisle', 'creisle', 'nreisle'],
};
