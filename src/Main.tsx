import './Main.scss';

import React, { useCallback, useContext, useState } from 'react';

import { AllBetsInDialog } from './components/AllBetsInDialog';
import { BettingDialog } from './components/BettingDialog';
import { Footer } from './components/Footer';
import { GameBoard } from './components/GameBoard';
import { GameCompleteDialog } from './components/GameCompleteDialog';
import { Header } from './components/Header';
import { JoinGameDialog } from './components/JoinGameDialog';
import { Menu } from './components/Menu';
import { PlayerDeck } from './components/PlayerDeck';
import { StartGameDialog } from './components/StartGameDialog';
import { TrickWonDialog } from './components/TrickWonDialog';
import { TrumpChosenDialog } from './components/TrumpChosenDialog';
import { DIALOG_TYPE, useGameStateDialogs } from './components/useGameStateDialog';
import { GameContext } from './Context';
import { GAME_STAGE, TOTAL_CARDS } from './types';

function Main() {
    const {
        activePlayer,
        allPlayersIn,
        cards,
        gameCode,
        joinGame,
        placeBet,
        playCard,
        playerId,
        players,
        ready,
        readyForNextTrick,
        roundNumber,
        scores,
        stage,
        startNewGame,
        trickNumber,
        trickWinner,
        trumpSuit,
    } = useContext(GameContext);

    const [scoreboardOpen, setBoardOpen] = useState(false);
    const [betDialogOpen, setBetOpen] = useState(false);
    const [deckOpen, setDeckOpen] = useState(false);

    const playerNumber = players.indexOf(playerId as string) + 1;

    const isSetup = stage === GAME_STAGE.SETTING_UP;

    const showReadyButton = Boolean(
        stage === GAME_STAGE.BETWEEN_TRICKS
        && playerId && !ready[playerId],
    );

    const handleCloseScoreBoard = () => {
        setBoardOpen(false);
    };

    const handleBetSelected = (bet: number) => {
        setBetOpen(false);
        placeBet(bet);
    };

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
    );
}

export {
    Main,
};
