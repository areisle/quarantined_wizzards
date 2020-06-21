import './index.scss';

import { Star } from '@material-ui/icons';
import React, { HTMLProps, ReactNode } from 'react';

export interface PlayerAvatarProps {
    /** the number of the player */
    player: number | null;
    /**
     * any content to place inside the avatar (icon, text etc.)
     */
    children?: ReactNode;
    /**
     * whether the avatar represents the active player
     * (the player whose turn it currently is)
     * @default false
     */
    active?: boolean;
    /**
     * whether the avatar represents the leader of the trick
     * @default false
     */
    leader?: boolean;
    /**
     * avatar that does not yet contain a player
     * @default false
     */
    empty?: boolean;
    style?: HTMLProps<HTMLDivElement>['style'];
}

function PlayerAvatar(props: PlayerAvatarProps) {
    const {
        player,
        children,
        active,
        leader,
        empty,
        ...rest
    } = props;

    return (
        <div
            className={`
                avatar
                avatar--square
                ${player ? `avatar--player-${player}` : ''}
                ${active ? 'avatar--active' : ''}
                ${leader ? 'avatar--leader' : ''}
                ${empty ? 'avatar--empty' : ''}
            `}
            {...rest}
        >
            {children}
            {leader && (
                <Star
                    className='avatar--leader__icon'
                    fontSize='large'
                />
            )}
        </div>
    );
}

export {
    PlayerAvatar,
};
