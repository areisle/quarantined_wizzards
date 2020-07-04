import React from 'react';

import { GAME_STAGE } from '../../types';
import { ScoreBoard, ScoreBoardProps } from '.';

export default {
    component: ScoreBoard,
    title: 'ScoreBoard',
    args: {
        players: ['areisle', 'creisle', 'nreisle'],
        scores: [],
        stage: GAME_STAGE.BETTING,
        roundNumber: 0,
        trickNumber: 0,
    },
};

export const Betting = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        variant='overall'
    />
);

export const Playing = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        scores={[
            {
                areisle: { bet: 1 },
                creisle: { bet: 1 },
                nreisle: { bet: 0 },
            },
        ]}
        stage={GAME_STAGE.PLAYING}
        variant='overall'
    />
);

export const BetweenTricks = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        scores={[
            {
                areisle: { bet: 1, taken: 0 },
                creisle: { bet: 1, taken: 1 },
                nreisle: { bet: 0, taken: 0 },
            },
        ]}
        stage={GAME_STAGE.BETWEEN_TRICKS}
        variant='overall'
    />
);

export const EndOfRound3 = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        roundNumber={2}
        scores={[
            {
                areisle: { bet: 1, taken: 0 },
                creisle: { bet: 1, taken: 1 },
                nreisle: { bet: 0, taken: 0 },
            },
            {
                areisle: { bet: 1, taken: 1 },
                creisle: { bet: 2, taken: 1 },
                nreisle: { bet: 0, taken: 0 },
            },
            {
                areisle: { bet: 1, taken: 0 },
                creisle: { bet: 0, taken: 0 },
                nreisle: { bet: 2, taken: 3 },
            },
        ]}
        stage={GAME_STAGE.BETWEEN_TRICKS}
        trickNumber={2}
        variant='overall'
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
            'freisle',
        ]}
        variant='overall'
    />
);

export const LongNames = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        players={[
            'blargh monkeys the second',
            'hello my name is????',
        ]}
        variant='overall'
    />
);

export const BetVariant = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        scores={[
            {
                areisle: { bet: 1, taken: 0 },
                creisle: { bet: 1, taken: 1 },
                nreisle: { bet: 0, taken: 0 },
            },
        ]}
        stage={GAME_STAGE.BETWEEN_TRICKS}
        variant='bet'
    />
);

export const RoundVariant = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        scores={[
            {
                areisle: { bet: 1, taken: 0 },
                creisle: { bet: 1, taken: 1 },
                nreisle: { bet: 0, taken: 0 },
            },
        ]}
        stage={GAME_STAGE.BETWEEN_TRICKS}
        variant='round'
    />
);
