import './Main.scss';

import React, { useContext, useState } from 'react';

import { GameContext } from './Context';
import { BettingDialog } from './components/BettingDialog';
import { Footer } from './components/Footer';
import { GameBoard } from './components/GameBoard';
import { Header } from './components/Header';
import { PlayerDeck } from './components/PlayerDeck';
import { ScoreBoard } from './components/ScoreBoard';

function Main() {
    const { 
        playerNumber,
        roundNumber,
        stage,
        trickNumber,
        trumpCard,
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
                onAllPlayersIn={console.log}
                showAllInButton={isSetup && playerNumber === 0}
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
        </div>
    )
}

export {
    Main,
}