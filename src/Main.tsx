import './Main.scss';

import React, { useContext, useState, useCallback } from 'react';

import { GameContext } from './Context';
import { BettingDialog } from './components/BettingDialog';
import { Footer } from './components/Footer';
import { GameBoard } from './components/GameBoard';
import { Header } from './components/Header';
import { PlayerDeck } from './components/PlayerDeck';
import { JoinGameDialog } from './components/JoinGameDialog';
import { StartGameDialog } from './components/StartGameDialog';
import { TrickWonDialog } from './components/TrickWonDialog';
import { GAME_STAGE, TOTAL_CARDS } from './types';
import { TrumpChosenDialog } from './components/TrumpChosenDialog';
import { AllBetsInDialog } from './components/AllBetsInDialog';
import { GameCompleteDialog } from './components/GameCompleteDialog';
import { Menu } from './components/Menu';
import { useGameStateDialogs, DIALOG_TYPE } from './components/useGameStateDialog';

function Main() {
    const {
        playerId,
        roundNumber,
        stage,
        trickNumber,
        trickWinner,
        trumpSuit,
        players,
        gameCode,
        startNewGame,
        joinGame,
        allPlayersIn,
        placeBet,
        playCard,
        ready,
        readyForNextTrick,
        scores,
        cards,
        activePlayer,
    } = useContext(GameContext);

    const [scoreboardOpen, setBoardOpen] = useState(false);
    const [betDialogOpen, setBetOpen] = useState(false);
    const [deckOpen, setDeckOpen] = useState(false);

    const playerNumber = players.indexOf(playerId as string) + 1;

    const isSetup = stage === GAME_STAGE.SETTING_UP;

    const showReadyButton = Boolean(
        stage === GAME_STAGE.BETWEEN_TRICKS
        && playerId && !ready[playerId]
    )

    const handleCloseScoreBoard = () => {
        setBoardOpen(false);
    }

    const handleBetSelected = (bet: number) => {
        setBetOpen(false);
        placeBet(bet);
    }

    const handleOpenDeck = useCallback(() => {
        setDeckOpen(true);
    }, []);

    const handleCloseDeck = useCallback(() => {
        setDeckOpen(false);
    }, []);

    const {
        currentDialog,
        dismissCurrentDialog,
    } = useGameStateDialogs({
        stage,
        trickNumber,
        trumpSuit,
        trickWinner,
        gameCode,
        playerId,
    });

    const handleStartGame = useCallback(() => {
        startNewGame();
        dismissCurrentDialog();
    }, [dismissCurrentDialog, startNewGame]);

    const handleJoinGame = useCallback((username) => {
        joinGame(username);
        dismissCurrentDialog();
    }, [dismissCurrentDialog, joinGame]);

    return (
        <div
            className={`
                main
                main--player-${playerNumber}
            `}
        >
            <Header
                onScoreBoardOpen={() => setBoardOpen(true)}
                roundNumber={roundNumber}
                stage={stage}
                totalRounds={TOTAL_CARDS / players.length}
                trickNumber={trickNumber}
                trumpSuit={trumpSuit}
            />
            <GameBoard
                onOpenBettingDialog={() => setBetOpen(true)}
            />
            <Footer
                disabled={players.length < 3}
                gameCode={gameCode}
                onAllPlayersIn={allPlayersIn}
                onReady={readyForNextTrick}
                showAllInButton={isSetup && playerId === players[0]}
                showReadyButton={showReadyButton}
            />
            <PlayerDeck
                activePlayer={activePlayer}
                cards={cards}
                onClose={handleCloseDeck}
                onOpen={handleOpenDeck}
                onPlaceCard={playCard}
                open={deckOpen}
                playerId={playerId}
                stage={stage}
            />
            <Menu
                onClose={handleCloseScoreBoard}
                open={scoreboardOpen}
            />
            <BettingDialog
                max={roundNumber + 1}
                onBetPlaced={handleBetSelected}
                onClose={() => setBetOpen(false)}
                open={betDialogOpen}
            />
            <TrickWonDialog
                onClose={dismissCurrentDialog}
                open={currentDialog === DIALOG_TYPE.TRICK_COMPLETE}
                playerNumber={players.indexOf(trickWinner as string)}
                players={players}
                round={roundNumber}
                scores={scores}
                trick={trickNumber}
                winner={trickWinner}
            />
            <JoinGameDialog
                onJoin={handleJoinGame}
                open={currentDialog === DIALOG_TYPE.JOIN_GAME}
            />
            <StartGameDialog
                onStart={handleStartGame}
                open={currentDialog === DIALOG_TYPE.START_GAME}
            />
            <TrumpChosenDialog
                onClose={dismissCurrentDialog}
                open={currentDialog === DIALOG_TYPE.TRUMP_CHOSEN}
                trumpSuit={trumpSuit}
            />
            <AllBetsInDialog
                onClose={dismissCurrentDialog}
                open={currentDialog === DIALOG_TYPE.ALL_BETS_IN}
                players={players}
                roundNumber={roundNumber}
                scores={scores}
                stage={stage}
                trickNumber={trickNumber}
            />
            <GameCompleteDialog
                onClose={dismissCurrentDialog}
                open={currentDialog === DIALOG_TYPE.GAME_COMPLETE}
                players={players}
                scores={scores}
            />
        </div>
    )
}

export {
    Main,
}
