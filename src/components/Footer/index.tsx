import './index.scss';

import React from 'react';
import { Button, Typography } from '@material-ui/core';

interface FooterProps {
    onAllPlayersIn: () => void;
    showAllInButton: boolean;
    disabled: boolean;
    showReadyButton: boolean;
    onReady: () => void;
}

function Footer(props: FooterProps) {
    const {
        onAllPlayersIn,
        showAllInButton,
        disabled,
        showReadyButton,
        onReady,
    } = props;

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
                            share url with other players for them to join
                    </Typography>
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