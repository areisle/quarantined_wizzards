import React from 'react';

import { DialogDecorator, dialogDecoratorArgs } from '../../decorators';
import { GameCompleteDialog, GameCompleteDialogProps } from '.';

export default {
    component: GameCompleteDialog,
    decorators: [DialogDecorator],
    title: 'dialogs/GameCompleteDialog',
};

export const Basic = (props: GameCompleteDialogProps) => (
    <GameCompleteDialog
        {...props}
        {...dialogDecoratorArgs}
    />
);

Basic.args = {
    open: true,
    players: ['areisle', 'creisle', 'nreisle'],
    scores: [
        {
            areisle: { bet: 0, taken: 0 },
            creisle: { bet: 0, taken: 0 },
            nreisle: { bet: 0, taken: 1 },
        },
        {
            areisle: { bet: 1, taken: 0 },
            creisle: { bet: 1, taken: 1 },
            nreisle: { bet: 0, taken: 0 },
        },
    ],
};
