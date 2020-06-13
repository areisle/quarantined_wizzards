import './index.scss';
import '../Avatar/index.scss';

import React, { useState, useEffect } from 'react';
import {
    Table,
    TableCell,
    TableHead,
    TableRow,
    TableBody,
    NativeSelect,
} from '@material-ui/core';

import { GAME_STAGE, GameState } from '../../types';
import { getRoundScore, getScore } from '../../utilities';

export type ScoreBoardProps = {
    /**
     * view of scoreboard
     * @default overall
     */
    variant?: 'round' | 'bet' | 'overall';
} & Pick<GameState, 'scores' | 'players' | 'trickNumber' | 'roundNumber' | 'stage'>;

function ScoreBoard(props: ScoreBoardProps) {
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
            className='score-board'
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

export {
    ScoreBoard,
}
