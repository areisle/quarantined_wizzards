import React from 'react';
import { StartGameDialog, StartGameDialogProps } from '.';
import { dialogDecoratorArgs, DialogDecorator } from '../../decorators';

export default {
    component: StartGameDialog,
    decorators: [DialogDecorator],
    title: 'dialogs/StartGameDialog',
}

export const Basic = (props: StartGameDialogProps) => (
    <StartGameDialog
        {...props}
        {...dialogDecoratorArgs}
    />
);

Basic.args = {
    open: true,
}
