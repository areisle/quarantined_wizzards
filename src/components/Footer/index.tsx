import './index.scss';

import React from 'react';
import { Button, Typography } from '@material-ui/core';

interface FooterProps {
    onAllPlayersIn: () => void;
    showAllInButton: boolean;
    disabled: boolean;
}

function Footer(props: FooterProps) {
    const {
        onAllPlayersIn,
        showAllInButton,
        disabled,
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

                
        </footer>
    )
}

export {
    Footer,
}