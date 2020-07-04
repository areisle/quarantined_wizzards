import React from 'react';

import { DialogDecorator, dialogDecoratorArgs } from '../../decorators';
import { StartGameDialog, StartGameDialogProps } from '.';

export default {
    component: StartGameDialog,
    decorators: [DialogDecorator],
    title: 'dialogs/StartGameDialog',
};

export const Basic = (props: StartGameDialogProps) => (
    <StartGameDialog
        {...props}
        {...dialogDecoratorArgs}
    />
);

Basic.args = {
    open: true,
};
