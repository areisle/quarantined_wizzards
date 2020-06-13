import './index.scss';

import React from 'react';
import { Button, Typography } from '@material-ui/core';
import { CopyIcon } from '../icons';
import { copyToClipboard } from '../../utilities';

interface FooterProps {
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
                        onClick={onAllPlayersIn}
                        disabled={disabled}
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
                        variant='outlined'
                        onClick={handleAddToClipboard}
                    >
                        game code: <span style={{ textTransform: 'none' }}> {gameCode}</span>
                    </Button>
                </>
            )}
            {showReadyButton && (
                <>
                    <Button
                        color='primary'
                        onClick={onReady}
                        disabled={disabled}
                        variant='contained'
                    >
                        Ready for next trick/round
                    </Button>
                </>
            )}
        </footer>
    )
}

export {
    Footer,
}
