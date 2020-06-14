import React from 'react';
import { TrumpChosenDialog, TrumpChosenDialogProps } from '.';
import { SUIT } from '../../types';
import { dialogDecoratorArgs, DialogDecorator } from '../../decorators';

export default {
    component: TrumpChosenDialog,
    decorators: [DialogDecorator],
    title: 'dialogs/TrumpChosenDialog',
}

export const HeartsChosen = (props: TrumpChosenDialogProps) => (
    <TrumpChosenDialog
        {...props}
        {...dialogDecoratorArgs}
    />
);

HeartsChosen.args = {
    open: true,
    trumpSuit: SUIT.HEARTS,
}

export const JesterChosen = (props: TrumpChosenDialogProps) => (
    <TrumpChosenDialog
        {...props}
        {...dialogDecoratorArgs}
        open={true}
        trumpSuit={SUIT.JESTER}
    />
);
