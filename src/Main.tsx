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
    } = useContext(GameContext);

    const [scoreboardOpen, setBoardOpen] = useState(false);
    const [betDialogOpen, setBetOpen] = useState(false);

    const isSetup = stage === 'awaiting-players';

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
                trump={trumpSuit}
                round={roundNumber}
                trick={trickNumber}
                stage={stage}
            />
            <GameBoard
                onOpenBettingDialog={() => setBetOpen(true)}
            />
            <Footer
                onAllPlayersIn={allPlayersIn}
                showAllInButton={isSetup && playerId === players[0]}
                disabled={players.length < 3}
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
                max={trickNumber + 1}
            />
            <TrickWonDialog
                playerNumber={players.indexOf(trickWinner as string)}
                winner={trickWinner}
                round={roundNumber}
                trick={trickNumber}
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
        </div>
    )
}

export {
    Main,
}