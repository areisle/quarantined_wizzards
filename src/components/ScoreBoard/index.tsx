import './index.scss';
import '../Avatar/index.scss';

import React, { useContext, useState, useEffect } from 'react';
import { GameContext } from '../../Context';
import { 
    Table, 
    TableCell, 
    TableHead, 
    TableRow, 
    TableBody,
    NativeSelect,
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Tabs,
    Tab, 
} from '@material-ui/core';

import { Refresh } from '@material-ui/icons';
import { GAME_STAGE, GameState } from '../../types';
import { Rules } from '../Rules';
import { getRoundScore, getScore } from '../../utilities';

interface ScoreBoardProps {
    open: boolean;
    onClose: () => void;
}

type RoundScoreBoardProps = {
    variant?: 'round' | 'bet' | 'overall';
} & Pick<GameState, 'scores' | 'players' | 'trickNumber' | 'roundNumber' | 'stage'>;

function RoundScoreBoard(props: RoundScoreBoardProps) {
    const {
        variant = 'overall',
        roundNumber,
        players,
        scores,
        trickNumber,
        stage,
    } = props;
    
    const [selectedRound, setSelectedRound] = useState(roundNumber);

    const handleSwapSelectedRound = (e: any) => {
        setSelectedRound(Number(e.target.value))
    }

    useEffect(() => {
        setSelectedRound(roundNumber);
    }, [roundNumber]);

    const showOverall = variant === 'overall';
    const showRoundScores = variant !== 'bet';

    const rows = players.map((playerId, index) => {
        const { bet, taken } = scores[selectedRound]?.[playerId] || {};
        const showBet = stage !== GAME_STAGE.BETTING || selectedRound !== roundNumber;
        const roundDone = (
            stage === GAME_STAGE.BETWEEN_TRICKS
            && trickNumber === roundNumber
        );

        let roundTotal = null;

        if (roundDone || selectedRound !== roundNumber) {
            roundTotal = getRoundScore(scores, playerId, selectedRound).total;
        }

        return (
            <TableRow key={index}>
                <TableCell
                    className={`avatar avatar--player-${index + 1}`}
                >
                    {playerId}
                </TableCell>
                <TableCell align='right'>{showBet && bet}</TableCell>
                {showRoundScores && (
                    <>
                    <TableCell align='right'>{taken || 0}</TableCell>
                    <TableCell align='right'>{roundDone && roundTotal}</TableCell>
                    {showOverall && (
                        <TableCell align='right'>
                            {getScore(
                                scores, 
                                playerId, 
                                roundDone ? roundNumber : roundNumber - 1,
                            )}
                        </TableCell>
                    )}
                    </>
                )}
            </TableRow>
        )
    });

    return (
        <Table 
            className='score-board__table'
            onClick={(e) => e.stopPropagation()}
            stickyHeader={true}
        >
            <TableHead>
                {showOverall && (
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell colSpan={3}>
                            <NativeSelect
                                value={selectedRound}
                                onChange={handleSwapSelectedRound}
                                fullWidth={true}
                            >
                                {Array(roundNumber + 1).fill(null).map((_, index) => (
                                    <option 
                                        key={index}
                                        value={index}
                                    >
                                        round {index + 1}
                                    </option>
                                ))}
                            </NativeSelect>
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                )}
                <TableRow>
                    <TableCell>user</TableCell>
                    <TableCell className='table-cell--skinny'>bet</TableCell>
                    {showRoundScores && (
                        <>
                    <TableCell className='table-cell--skinny'>taken</TableCell>
                    <TableCell className='table-cell--skinny'>total</TableCell>
                    </>
                    )}
                    {showOverall && (
                        <TableCell>overall total</TableCell>
                    )}
                </TableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
        </Table>
    )
}

enum TAB {
    SCORES,
    RULES,
}

function ScoreBoard(props: ScoreBoardProps) {
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
    }

    return (
        <Dialog 
            open={open}
            onClose={onClose}
            className='score-board'
        >
            <DialogContent>
                <Tabs 
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab value={TAB.SCORES} label='Scores' />
                    <Tab value={TAB.RULES} label='Rules' />
                </Tabs>
                {(activeTab === TAB.SCORES) && (
                    <RoundScoreBoard
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
        </Dialog>
    )
}

export {
    ScoreBoard,
    RoundScoreBoard,
}