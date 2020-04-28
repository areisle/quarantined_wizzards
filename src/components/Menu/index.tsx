import './index.scss';

import React, { useContext, useState } from 'react';
import { GameContext } from '../../Context';
import {
    DialogContent,
    DialogActions,
    Button,
    Tabs,
    Tab,
    DialogTitle,
    Card,
} from '@material-ui/core';

import { Refresh } from '@material-ui/icons';
import { Rules } from '../Rules';
import { ScoreBoard } from '../ScoreBoard';

enum TAB {
    SCORES,
    RULES,
}

function Menu() {
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
    }

    return (
        <Card
            className='game-menu'
        >
            <DialogTitle
                disableTypography={true}
            >

                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab value={TAB.SCORES} label='Scores' />
                    <Tab value={TAB.RULES} label='Rules' />
                </Tabs>
            </DialogTitle>
            <DialogContent>
                {(activeTab === TAB.SCORES) && (
                    <ScoreBoard
                        scores={scores}
                        trickNumber={trickNumber}
                        roundNumber={roundNumber}
                        players={players}
                        stage={stage}
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
        </Card>
    )
}

export {
    Menu,
}