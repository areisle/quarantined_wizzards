import React from 'react';
import { ScoreBoard, ScoreBoardProps } from '.';
import { GAME_STAGE } from '../../types';

export default {
    component: ScoreBoard,
    title: 'ScoreBoard',
    args: {
        players: ['areisle', 'creisle', 'nreisle'],
        scores: [],
        stage: GAME_STAGE.BETTING,
        roundNumber: 0,
        trickNumber: 0,
    }
}

export const Betting = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
    />
);

export const Playing = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        stage={GAME_STAGE.PLAYING}
        scores={[
            {
                areisle: { bet: 1 },
                creisle: { bet: 1 },
                nreisle: { bet: 0 },
            }
        ]}
    />
);

export const BetweenTricks = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        stage={GAME_STAGE.BETWEEN_TRICKS}
        scores={[
            {
                areisle: { bet: 1, taken: 0 },
                creisle: { bet: 1, taken: 1, },
                nreisle: { bet: 0, taken: 0 },
            }
        ]}
    />
);

export const EndOfRound3 = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        stage={GAME_STAGE.BETWEEN_TRICKS}
        roundNumber={2}
        trickNumber={2}
        scores={[
            {
                areisle: { bet: 1, taken: 0 },
                creisle: { bet: 1, taken: 1, },
                nreisle: { bet: 0, taken: 0 },
            },
            {
                areisle: { bet: 1, taken: 1 },
                creisle: { bet: 2, taken: 1, },
                nreisle: { bet: 0, taken: 0 },
            },
            {
                areisle: { bet: 1, taken: 0 },
                creisle: { bet: 0, taken: 0, },
                nreisle: { bet: 2, taken: 3 },
            },
        ]}
    />
);

export const MaxPlayers = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        players={[
            'areisle',
            'creisle',
            'nreisle',
            'mreisle',
            'kreisle',
            'freisle'
        ]}
    />
);

export const LongNames = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        players={[
            'blargh monkeys the second',
            'hello my name is????',
        ]}
    />
);
