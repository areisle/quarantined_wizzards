import React from 'react';

import { PlayerAvatar, PlayerAvatarProps } from '.';

export default {
    component: PlayerAvatar,
    title: 'PlayerAvatar',
    args: {
        player: null,
    },
};

export const Empty = (props: PlayerAvatarProps) => (
    <PlayerAvatar
        {...props}
    />
);

Empty.args = {
    empty: true,
};

export const Player1 = (props: PlayerAvatarProps) => (
    <PlayerAvatar
        {...props}
        player={1}
    />
);

export const Player2 = (props: PlayerAvatarProps) => (
    <PlayerAvatar
        {...props}
        player={2}
    />
);

export const Player3 = (props: PlayerAvatarProps) => (
    <PlayerAvatar
        {...props}
        player={3}
    />
);

export const Leader = (props: PlayerAvatarProps) => (
    <PlayerAvatar
        {...props}
        leader={true}
        player={2}
    />
);

export const Active = (props: PlayerAvatarProps) => (
    <PlayerAvatar
        {...props}
        active={true}
        player={2}
    />
);
