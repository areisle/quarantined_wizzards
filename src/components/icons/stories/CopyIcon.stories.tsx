import React from 'react';
import { CopyIcon } from '..';
import { SvgIconProps } from '@material-ui/core';

export default {
    component: CopyIcon,
    title: 'icons/CopyIcon',
}

export const Copy = (props: SvgIconProps) => (
    <CopyIcon {...props} />
);
