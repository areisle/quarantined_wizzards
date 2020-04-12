import React from 'react';
import './App.css';
import { PlayerDeck } from './components/PlayerDeck';
import { GameBoard } from './components/GameBoard';
import { GameContextProvider } from './Context';

function App() {
  return (
    <div className="app">
        <GameContextProvider>
            <GameBoard />
            <PlayerDeck />
        </GameContextProvider>
    </div>
  );
}

export default App;
