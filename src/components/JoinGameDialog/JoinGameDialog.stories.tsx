import React from 'react';

import { DialogDecorator, dialogDecoratorArgs } from '../../decorators';
import { JoinGameDialog, JoinGameDialogProps } from '.';

export default {
    component: JoinGameDialog,
    decorators: [DialogDecorator],
    title: 'dialogs/JoinGameDialog',
};

export const Basic = (props: JoinGameDialogProps) => (
    <JoinGameDialog
        {...props}
        {...dialogDecoratorArgs}
    />
);

Basic.args = {
    open: true,
};
