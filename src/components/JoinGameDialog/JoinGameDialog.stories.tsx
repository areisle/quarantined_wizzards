import React from 'react';
import { JoinGameDialog, JoinGameDialogProps } from '.';
import { dialogDecoratorArgs, DialogDecorator } from '../../decorators';

export default {
    component: JoinGameDialog,
    decorators: [DialogDecorator],
    title: 'dialogs/JoinGameDialog',
}

export const Basic = (props: JoinGameDialogProps) => (
    <JoinGameDialog
        {...props}
        {...dialogDecoratorArgs}
    />
);

Basic.args = {
    open: true,
}
