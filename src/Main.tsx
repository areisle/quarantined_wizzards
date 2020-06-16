import './Main.scss';

import React, { useCallback, useContext, useState } from 'react';

import { AllBetsInDialog } from './components/AllBetsInDialog';
import { BettingDialog } from './components/BettingDialog';
import { ChooseTrumpDialog } from './components/ChooseTrumpDialog';
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
                playerNumber={players.indexOf(trickWinner as string)}
                players={players}
                round={roundNumber}
                scores={scores}
                trick={trickNumber}
                winner={trickWinner}
            />
            <JoinGameDialog
                onJoin={joinGame}
                open={Boolean(gameCode && playerId === null)}
            />
            <StartGameDialog
                onStart={startNewGame}
                open={!gameCode}
            />
            <ChooseTrumpDialog
                onStart={startNewGame}
                open={false}
            />
            <TrumpChosenDialog
                stage={stage}
                trumpSuit={trumpSuit}
            />
            <AllBetsInDialog
                players={players}
                roundNumber={roundNumber}
                scores={scores}
                stage={stage}
                trickNumber={trickNumber}
            />
            <GameCompleteDialog
                players={players}
                scores={scores}
                stage={stage}
            />
        </div>
    );
}

export {
    Main,
};
