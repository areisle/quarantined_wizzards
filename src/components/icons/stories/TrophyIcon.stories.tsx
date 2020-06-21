import React from 'react';

import { TrophyIcon, TrophyIconProps } from '..';

export default {
    component: TrophyIcon,
    title: 'icons/TrophyIcon',
};

export const Gold = (props: TrophyIconProps) => (
    <TrophyIcon {...props} />
);

export const Silver = (props: TrophyIconProps) => (
    <TrophyIcon
        {...props}
        variant='silver'
    />
);

export const Bronze = (props: TrophyIconProps) => (
    <TrophyIcon
        {...props}
        variant='bronze'
    />
);
