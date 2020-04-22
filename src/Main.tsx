import './Main.scss';

import React, { useContext, useState } from 'react';

import { GameContext } from './Context';
import { BettingDialog } from './components/BettingDialog';
import { Footer } from './components/Footer';
import { GameBoard } from './components/GameBoard';
import { Header } from './components/Header';
import { PlayerDeck } from './components/PlayerDeck';
import { ScoreBoard } from './components/ScoreBoard';
import { JoinGameDialog } from './components/JoinGameDialog';
import { StartGameDialog } from './components/StartGameDialog';
import { TrickWonDialog } from './components/TrickWonDialog';
import { ChooseTrumpDialog } from './components/ChooseTrumpDialog';
import { GAME_STAGE } from './types';
import { TrumpChosenDialog } from './components/TrumpChosenDialog';
import { AllBetsInDialog } from './components/AllBetsInDialog';

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
    } = useContext(GameContext);

    const [scoreboardOpen, setBoardOpen] = useState(false);
    const [betDialogOpen, setBetOpen] = useState(false);

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

    return (
        <div className='main'>
            <Header
                onScoreBoardOpen={() => setBoardOpen(true)}
                trumpSuit={trumpSuit}
                roundNumber={roundNumber}
                trickNumber={trickNumber}
                stage={stage}
            />
            <GameBoard
                onOpenBettingDialog={() => setBetOpen(true)}
            />
            <Footer
                onAllPlayersIn={allPlayersIn}
                showAllInButton={isSetup && playerId === players[0]}
                disabled={players.length < 3}
                showReadyButton={showReadyButton}
                onReady={readyForNextTrick}
            />
            <PlayerDeck
                onPlaceCard={playCard}
            />
            <ScoreBoard
                open={scoreboardOpen}
                onClose={handleCloseScoreBoard}
            />
            <BettingDialog
                open={betDialogOpen}
                onClose={() => setBetOpen(false)}
                onBetPlaced={handleBetSelected}
                max={roundNumber + 1}
            />
            <TrickWonDialog
                playerNumber={players.indexOf(trickWinner as string)}
                winner={trickWinner}
                round={roundNumber}
                trick={trickNumber}
                players={players}
                scores={scores}
            />
            <JoinGameDialog
                open={Boolean(gameCode && playerId === null)}
                onJoin={joinGame}
            />
            <StartGameDialog
                open={!gameCode}
                onStart={startNewGame}
            />
            <ChooseTrumpDialog
                open={false}
                onStart={startNewGame}
            />
            <TrumpChosenDialog 
                stage={stage}
                trumpSuit={trumpSuit}
            />
            <AllBetsInDialog
                roundNumber={roundNumber}
                trickNumber={trickNumber}
                players={players}
                scores={scores}
                stage={stage}
            />
        </div>
    )
}

export {
    Main,
}