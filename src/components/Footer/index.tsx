import './index.scss';

import { Button, Typography } from '@material-ui/core';
import React from 'react';

import { copyToClipboard } from '../../utilities';
import { CopyIcon } from '../icons';

export interface FooterProps {
    onAllPlayersIn: () => void;
    showAllInButton: boolean;
    disabled: boolean;
    showReadyButton: boolean;
    onReady: () => void;
    gameCode: string | null;
}

function Footer(props: FooterProps) {
    const {
        onAllPlayersIn,
        showAllInButton,
        disabled,
        showReadyButton,
        onReady,
        gameCode,
    } = props;

    const handleAddToClipboard = () => {
        if (!gameCode) { return; }
        copyToClipboard(window.location.href);
    };

    return (
        <footer className='game-footer'>
            {showAllInButton && (
                <>
                    <Button
                        color='primary'
                        disabled={disabled}
                        onClick={onAllPlayersIn}
                        variant='contained'
                    >
                        All players in
                    </Button>
                    <Typography
                        variant='caption'
                    >
                        share url or game code with other players for them to join
                    </Typography>
                    <Button
                        endIcon={<CopyIcon />}
                        onClick={handleAddToClipboard}
                        variant='outlined'
                    >
                        game code:
                        {' '}
                        <span style={{ textTransform: 'none' }}>
                            {' '}
                            {gameCode}
                        </span>
                    </Button>
                </>
            )}
            {showReadyButton && (
                <>
                    <Button
                        color='primary'
                        disabled={disabled}
                        onClick={onReady}
                        variant='contained'
                    >
                        Ready for next trick/round
                    </Button>
                </>
            )}
        </footer>
    );
}

export {
    Footer,
};
