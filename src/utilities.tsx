import { useEffect, useRef } from "react";
import { GameState, PlayerId, ScoreWithTotal } from "./types";

function usePrevious<T = unknown>(value: T) {
    const ref = useRef<T>();
    const prevValue = ref.current;

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return prevValue;
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

/**
 * returns the indices of the first, second, third place players
 */
function getGameWinners(players: PlayerId[], scores: GameState['scores']) {
    const totalScores = players.map((playerId, playerIndex) => ({
        score: getScore(scores, playerId, 60 / players.length),
        playerIndex,
    }));

    const [
        first,
        second,
        third,
    ] = totalScores.sort((a, b) => b.score - a.score).map(a => a.playerIndex);

    return {
        first,
        second,
        third,
    }
}

export {
    usePrevious,
    getRoundScore,
    getScore,
    getGameWinners,
}