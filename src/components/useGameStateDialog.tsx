import { DialogProps } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';

import { GAME_STAGE, GameState, PlayerId } from '../types';
import { usePrevious } from '../utilities';

export interface GameStateDialogProps extends Omit<DialogProps, 'onClose'> {
    open: boolean;
    onClose?: () => void;
}

export interface UseGameStateDialogsProps {
    stage: GAME_STAGE;
    trickNumber: GameState['trickNumber'];
    trumpSuit: GameState['trumpSuit'];
    trickWinner: PlayerId | null;
    gameCode: GameState['gameCode'];
    playerId: GameState['playerId'];
}

export enum DIALOG_TYPE {
    START_GAME = 1,
    JOIN_GAME,
    ALL_BETS_IN,
    TRUMP_CHOSEN,
    GAME_COMPLETE,
    TRICK_COMPLETE,
}

function useGameStateDialogs(props: UseGameStateDialogsProps) {
    const {
        stage,
        trickNumber,
        trumpSuit,
        trickWinner,
        gameCode,
        playerId,
    } = props;

    const [currentDialog, setCurrentDialog] = useState<DIALOG_TYPE | null>(null);

    const prevStage = usePrevious(stage);
    const prevTrump = usePrevious(trumpSuit);

    const dismissCurrentDialog = useCallback(() => {
        setCurrentDialog(null);
    }, []);

    useEffect(() => {
        if (!gameCode) {
            setCurrentDialog(DIALOG_TYPE.START_GAME);
        } else if (!playerId) {
            setCurrentDialog(DIALOG_TYPE.JOIN_GAME);
        } else if (
            trumpSuit !== prevTrump
            && stage === GAME_STAGE.BETTING
        ) {
            setCurrentDialog(DIALOG_TYPE.TRUMP_CHOSEN);
        } else if (
            prevStage === GAME_STAGE.BETTING
            && stage === GAME_STAGE.PLAYING
            && trickNumber === 0
        ) {
            setCurrentDialog(DIALOG_TYPE.ALL_BETS_IN);
        } else if (trickWinner) {
            setCurrentDialog(DIALOG_TYPE.TRICK_COMPLETE);
        } else if (stage === GAME_STAGE.COMPLETE) {
            setCurrentDialog(DIALOG_TYPE.GAME_COMPLETE);
        }
    }, [
        gameCode,
        playerId,
        prevStage,
        prevTrump,
        stage,
        trickNumber,
        trickWinner,
        trumpSuit,
    ]);

    return {
        dismissCurrentDialog,
        currentDialog,
    };
}

export {
    useGameStateDialogs,
};
