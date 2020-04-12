import './index.scss';

import { Star } from '@material-ui/icons';
import React, { ReactNode } from 'react';

interface PlayerAvatarProps {
    player: number | null;
    children?: ReactNode;
    active?: boolean;
    leader?: boolean;
    empty?: boolean;
}

function PlayerAvatar(props: PlayerAvatarProps) {
    const { player, children, active, leader, empty } = props;

    return (
        <div
            className={`
                avatar 
                avatar--square
                ${player ? `avatar--player-${player}`: ''} 
                ${active ? 'avatar--active' : ''}
                ${leader ? 'avatar--leader' : ''}
                ${empty ? 'avatar--empty' : ''}
            `}
        >
            {children}
            {leader && (
                <Star
                    className='avatar--leader__icon'
                    fontSize='large'
                />
            )}
        </div>
    )
}

export {
    PlayerAvatar
}