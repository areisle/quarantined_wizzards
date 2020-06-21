import React from 'react';

import { GAME_STAGE, SUIT } from '../../types';
import { Header, HeaderProps } from '.';

export default {
    component: Header,
    title: 'Header',
    args: {
        stage: GAME_STAGE.PLAYING,
        trumpSuit: SUIT.HEARTS,
        roundNumber: 0,
        trickNumber: 0,
        totalRounds: 20,
    },
};

export const Example = (props: HeaderProps) => (
    <Header
        {...props}
    />
);

export const SettingUp = (props: HeaderProps) => (
    <Header
        {...props}
        stage={GAME_STAGE.SETTING_UP}
    />
);

export const Betting = (props: HeaderProps) => (
    <Header
        {...props}
        stage={GAME_STAGE.BETTING}
        trumpSuit={SUIT.CLUBS}
    />
);

export const Playing = (props: HeaderProps) => (
    <Header
        {...props}
        stage={GAME_STAGE.PLAYING}
        trumpSuit={SUIT.DIAMONDS}
    />
);
