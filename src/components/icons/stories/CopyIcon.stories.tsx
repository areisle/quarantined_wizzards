import { SvgIconProps } from '@material-ui/core';
import React from 'react';

import { CopyIcon } from '..';

export default {
    component: CopyIcon,
    title: 'icons/CopyIcon',
};

export const Copy = (props: SvgIconProps) => (
    <CopyIcon {...props} />
);
