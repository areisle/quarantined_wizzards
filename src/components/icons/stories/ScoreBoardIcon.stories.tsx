import { SvgIconProps } from '@material-ui/core';
import React from 'react';

import { ScoreBoardIcon } from '..';

export default {
    component: ScoreBoardIcon,
    title: 'icons/ScoreBoardIcon',
};

export const ScoreBoard = (props: SvgIconProps) => (
    <ScoreBoardIcon {...props} />
);
