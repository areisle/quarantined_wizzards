import './index.scss';

import React from 'react';
import { Button } from '@material-ui/core';

interface FooterProps {
    onAllPlayersIn: () => void;
    showAllInButton: boolean;
}

function Footer(props: FooterProps) {
    const {
        onAllPlayersIn,
        showAllInButton,
    } = props;

    return (
        <footer className='game-footer'>
            {showAllInButton && (
                <Button
                    color='primary'
                    onClick={onAllPlayersIn}
                    variant='contained'
                >
                    All players in
                </Button>
            )}
        </footer>
    )
}

export {
    Footer,
}