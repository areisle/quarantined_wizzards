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
} from '@material-ui/core';
import isNil from 'lodash.isnil';

import { Close } from '@material-ui/icons';
import { IconButton } from '@material-ui/core';
import { GameState, PlayerId, GAME_STAGE } from '../../types';
import { Rules } from '../Rules';

interface ScoreBoardProps {
    open: boolean;
    onClose: () => void;
}

function getRoundScore(
    scores: GameState['scores'], 
    playerId: PlayerId,
    roundNumber: number,
) {
    let score = null;

    const { bet, taken } = scores[roundNumber]?.[playerId] || {};
    if (!isNil(bet) && !isNil(taken)) {
        if (bet === taken) {
            score = bet * 10 + 20;
        } else {
            score = -Math.abs(bet- taken) * 10;
        }
    }

    return score;
}

function getScore(
    scores: GameState['scores'], 
    playerId: PlayerId,
    roundNumber: number,
) {
    let score = 0;

    for (let i=0; i <= roundNumber; i++) {
        score += getRoundScore(scores, playerId, i) ?? 0;
    }

    return score;
}

function ScoreBoard(props: ScoreBoardProps) {
    const { open, onClose } = props;
    const {
        roundNumber,
        players,
        scores,
        stage,
    } = useContext(GameContext);
    const [selectedRound, setSelectedRound] = useState(roundNumber);

    const handleSwapSelectedRound = (e: any) => {
        setSelectedRound(Number(e.target.value))
    }

    useEffect(() => {
        setSelectedRound(roundNumber);
    }, [roundNumber]);

    const rows = players.map((playerId, index) => {
        const { bet, taken } = scores[selectedRound]?.[playerId] || {};
        const showBet = true || stage !== GAME_STAGE.BETTING || selectedRound !== roundNumber;
        const roundDone = selectedRound !== roundNumber || stage === GAME_STAGE.BETWEEN_TRICKS;

        const roundTotal = getRoundScore(scores, playerId, selectedRound);
        const totalScore = getScore(scores, playerId, 60 / players.length - 1)
        return (
            <TableRow key={index}>
                <TableCell
                    className={`avatar avatar--player-${index + 1}`}
                >
                    {playerId}
                </TableCell>
                <TableCell align='right'>{showBet && bet}</TableCell>
                <TableCell align='right'>{taken}</TableCell>
                <TableCell align='right'>{roundDone && roundTotal}</TableCell>
                <TableCell align='right'>{totalScore}</TableCell>
            </TableRow>
        )
    });

    return (
        <div
            className={`score-board score-board--${open ? 'open' : 'closed'}`}
            onClick={onClose}
        >
            <IconButton
                 aria-label='close overlay'
                 className='overlay__close-button'
            >
                <Close 
                    htmlColor='white' 
                    fontSize='large'
                />
            </IconButton>
            <Table 
                className='score-board__table'
                onClick={(e) => e.stopPropagation()}
                stickyHeader={true}
            >
                <TableHead>
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
                    <TableRow>
                        <TableCell>user</TableCell>
                        <TableCell>bet</TableCell>
                        <TableCell>taken</TableCell>
                        <TableCell>total</TableCell>
                        <TableCell>overall total</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{rows}</TableBody>
            </Table>
            <Rules />
        </div>
    )
}

export {
    ScoreBoard
}