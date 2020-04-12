import './Main.scss';

import React, { useContext, useState } from 'react';

import { PlayerDeck } from './components/PlayerDeck';
import { GameBoard } from './components/GameBoard';
import { Header } from './components/Header';
import { GameContext } from './Context';
import { Footer } from './components/Footer';
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
    
    const isSetup = stage === 'awaiting-players';

    const handleCloseScoreBoard = () => {
        setBoardOpen(false);
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
            <GameBoard />
            <Footer
                onAllPlayersIn={console.log}
                showAllInButton={isSetup && playerNumber === 0}
            />
            <PlayerDeck />
            <ScoreBoard 
                open={scoreboardOpen}
                onClose={handleCloseScoreBoard}
            />
        </div>
    )
}

export {
    Main,
}