import React from 'react';
import { AllBetsInDialog, AllBetsInDialogProps } from '.';
import { dialogDecoratorArgs, DialogDecorator } from '../../decorators';
import { GAME_STAGE } from '../../types';

export default {
    component: AllBetsInDialog,
    decorators: [DialogDecorator],
    title: 'dialogs/AllBetsInDialog',
}

export const Basic = (props: AllBetsInDialogProps) => (
    <AllBetsInDialog
        {...props}
        {...dialogDecoratorArgs}
    />
);

Basic.args = {
    open: true,
    players: ['areisle', 'creisle', 'nreisle'],
    stage: GAME_STAGE.PLAYING,
    trickNumber: 0,
    roundNumber: 0,
    scores: [
        {
            areisle: { bet: 0 },
            creisle: { bet: 1 },
            nreisle: { bet: 1 },
        }
    ]
}
