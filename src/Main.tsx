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

function Main() {
    const { 
        playerNumber,
        roundNumber,
        stage,
        trickNumber,
        trumpCard,
        players,
        gameCode,
        startNewGame,
        joinGame,
        allPlayersIn,
    } = useContext(GameContext);

    const [scoreboardOpen, setBoardOpen] = useState(false);
    const [betDialogOpen, setBetOpen] = useState(false);
    const isSetup = stage === 'awaiting-players';

    const handleCloseScoreBoard = () => {
        setBoardOpen(false);
    }

    /**
     * @todo handle bet value
     */
    const handleBetSelected = (bet: number) => {
        setBetOpen(false);
    }
    
    return (
        <div className='main'>
            <Header
                onScoreBoardOpen={() => setBoardOpen(true)}
                trump={trumpCard}
                round={roundNumber}
                trick={trickNumber}
                stage={stage}
            />
            <GameBoard
                onOpenBettingDialog={() => setBetOpen(true)}
            />
            <Footer
                onAllPlayersIn={allPlayersIn}
                showAllInButton={isSetup && playerNumber === 0}
                disabled={players.length < 3}
            />
            <PlayerDeck />
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
            <JoinGameDialog
                open={Boolean(gameCode && playerNumber === null)}
                onJoin={joinGame}
            />
            <StartGameDialog
                open={!gameCode}
                onStart={startNewGame}
            />
        </div>
    )
}

export {
    Main,
}