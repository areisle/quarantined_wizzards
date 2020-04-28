import './Main.scss';

import React, { useContext, useState, useLayoutEffect } from 'react';
import { Dialog } from '@material-ui/core';

import { GameContext } from './Context';
import { BettingDialog } from './components/BettingDialog';
import { Footer } from './components/Footer';
import { GameBoard } from './components/GameBoard';
import { Header } from './components/Header';
import { PlayerDeck } from './components/PlayerDeck';
import { JoinGameDialog } from './components/JoinGameDialog';
import { StartGameDialog } from './components/StartGameDialog';
import { TrickWonDialog } from './components/TrickWonDialog';
import { ChooseTrumpDialog } from './components/ChooseTrumpDialog';
import { GAME_STAGE, TOTAL_CARDS } from './types';
import { TrumpChosenDialog } from './components/TrumpChosenDialog';
import { AllBetsInDialog } from './components/AllBetsInDialog';
import { GameCompleteDialog } from './components/GameCompleteDialog';
import { Menu } from './components/Menu';

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

    const [useWideLayout, setUseWide] = useState(false);

    useLayoutEffect(() => {
        const handleResize = () => {
            let min = 1000;
            if (players.length > 4) {
                min = 1400;
            }
            setUseWide(window.innerWidth >= min);
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [players.length]);

    return (
        <div 
            className={`
                main 
                main--${useWideLayout ? 'wide' : ''}
                main--player-${playerNumber}
            `}
        >
            <Header
                onScoreBoardOpen={() => setBoardOpen(true)}
                trumpSuit={trumpSuit}
                roundNumber={roundNumber}
                trickNumber={trickNumber}
                stage={stage}
                totalRounds={TOTAL_CARDS / players.length}
                showMenuButton={!useWideLayout}
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
                gameCode={gameCode}
            />
            {!useWideLayout && (
                <Dialog 
                    open={scoreboardOpen}
                    onClose={handleCloseScoreBoard}
                >
                    <Menu />
                </Dialog>
            )}
            {useWideLayout && (
                <Menu />
            )}
            <PlayerDeck
                onPlaceCard={playCard}
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
            <GameCompleteDialog
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
