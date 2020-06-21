import React from 'react';

import { GameContextProvider } from './Context';
import { Main } from './Main';

function App() {
    return (
        <GameContextProvider>
            <Main />
        </GameContextProvider>
    );
}

export default App;
