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

import { Close } from '@material-ui/icons';
import { IconButton } from '@material-ui/core';
import { GAME_STAGE, GameState, PlayerId, ScoreWithTotal } from '../../types';
import { Rules } from '../Rules';

interface ScoreBoardProps {
    open: boolean;
    onClose: () => void;
}

function getRoundScore(
    scores: GameState['scores'], 
    playerId: PlayerId,
    roundNumber: number,
): ScoreWithTotal {
    let score = null;

    const { bet, taken } = scores[roundNumber]?.[playerId] || {};
    let numBet = bet || 0;
    let numTaken = taken || 0;

    if (numBet === numTaken) {
        score = numBet * 10 + 20;
    } else {
        score = -Math.abs(numBet - numTaken) * 10;
    }

    return {
        bet,
        taken,
        total: score,
    };
}

function getScore(
    scores: GameState['scores'], 
    playerId: PlayerId,
    roundNumber: number,
) {
    let score = 0;

    for (let i=0; i <= roundNumber; i++) {
        score += getRoundScore(scores, playerId, i).total ?? 0;
    }

    return score;
}

type RoundScoreBoardProps = {
    allowChangeSelectedRound?: boolean;
    showCumulativeTotal?: boolean;
} & Pick<GameState, 'scores' | 'players' | 'trickNumber' | 'roundNumber' | 'stage'>;

function RoundScoreBoard(props: RoundScoreBoardProps) {
    const {
        allowChangeSelectedRound,
        showCumulativeTotal,
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
                <TableCell align='right'>{taken || 0}</TableCell>
                <TableCell align='right'>{roundDone && roundTotal}</TableCell>
                {showCumulativeTotal && (
                    <TableCell align='right'>
                        {getScore(
                            scores, 
                            playerId, 
                            roundDone ? roundNumber : roundNumber - 1,
                        )}
                    </TableCell>
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
                {allowChangeSelectedRound && (
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
                        {showCumulativeTotal && (
                            <TableCell></TableCell>
                        )}
                    </TableRow>
                )}
                <TableRow>
                    <TableCell>user</TableCell>
                    <TableCell>bet</TableCell>
                    <TableCell>taken</TableCell>
                    <TableCell>total</TableCell>
                    {showCumulativeTotal && (
                        <TableCell>overall total</TableCell>
                    )}
                </TableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
        </Table>
    )
}

function ScoreBoard(props: ScoreBoardProps) {
    const { open, onClose } = props;
    const {
        roundNumber,
        players,
        scores,
        stage,
        trickNumber,
    } = useContext(GameContext);

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
            <RoundScoreBoard
                scores={scores}
                trickNumber={trickNumber}
                roundNumber={roundNumber}
                players={players}
                stage={stage}
                allowChangeSelectedRound={true}
                showCumulativeTotal={true}
            />
            <Rules />
        </div>
    )
}

export {
    ScoreBoard,
    RoundScoreBoard,
}