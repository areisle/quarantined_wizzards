import './index.scss';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Tab,
    Tabs,
} from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
import React, { useContext, useState } from 'react';

import { GameContext } from '../../Context';
import { Rules } from '../Rules';
import { ScoreBoard } from '../ScoreBoard';

interface MenuProps {
    open: boolean;
    onClose: () => void;
}

enum TAB {
    SCORES,
    RULES,
}

function Menu(props: MenuProps) {
    const { open, onClose } = props;
    const {
        roundNumber,
        players,
        scores,
        stage,
        trickNumber,
        refreshGameData,
    } = useContext(GameContext);

    const [activeTab, setActiveTab] = useState(TAB.SCORES);

    const handleTabChange = (_: any, nextTab: number) => {
        setActiveTab(nextTab);
    };

    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation();
        refreshGameData();
    };

    return (
        <Dialog
            className='game-menu'
            onClose={onClose}
            open={open}
        >
            <DialogTitle
                disableTypography={true}
            >

                <Tabs
                    indicatorColor='primary'
                    onChange={handleTabChange}
                    textColor='primary'
                    value={activeTab}
                >
                    <Tab label='Scores' value={TAB.SCORES} />
                    <Tab label='Rules' value={TAB.RULES} />
                </Tabs>
            </DialogTitle>
            <DialogContent>
                {(activeTab === TAB.SCORES) && (
                    <ScoreBoard
                        players={players}
                        roundNumber={roundNumber}
                        scores={scores}
                        stage={stage}
                        trickNumber={trickNumber}
                        variant='overall'
                    />
                )}
                {(activeTab === TAB.RULES) && (
                    <Rules />
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    endIcon={<Refresh />}
                    onClick={handleRefresh}
                >
                    refresh game state
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export {
    Menu,
};
