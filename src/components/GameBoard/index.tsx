import './index.scss';

import React, { useContext, useState, ReactNode } from 'react';
import { PlayerAvatar } from '../Avatar';
import { GameContext, Card } from '../../Context';
import { Button, IconButton } from '@material-ui/core';
import { ScoreBoardIcon } from '../../icons';
import { ScoreBoard } from '../ScoreBoard';
import isNil from 'lodash.isnil';
import { Done } from '@material-ui/icons';
import { PlayingCard } from '../PlayingCard';

const MAX_NUMBER_OF_PLAYERS = 6;
const cardToString = (card: Card | null) => card && (card.special ?? `${card?.number} of ${card?.suit}`);

function Fillers(props: { players: number, show: boolean; }) {
    const { players, show } = props;
    if (!show) {
        return null;
    }

    const shells = new Array(MAX_NUMBER_OF_PLAYERS - players).fill(null).map((_, index) => (
        <PlayerAvatar
            key={index + players}
            player={index + players + 1}
            empty={true}
        />
    ))
    return (
        <>{shells}</>
    )
}

function GameBoard() {
    const { 
        activePlayer,
        playerNumber,
        players,
        roundNumber,
        scores,
        stage,
        trickCards,
        trickLeader,
        trickNumber,
        trumpCard,
    } = useContext(GameContext);

    const [scoreboardOpen, setBoardOpen] = useState(false);
    
    const isSetup = stage === 'awaiting-players';
    const isPlaying = stage === 'playing';
    const isBetting = stage === 'betting';

    const avatars = players.map((username, index) => {
        const { bet } = scores[roundNumber]?.[index] ?? {};

        let content: ReactNode = null;
        const isActive = activePlayer === index;
        const isCurrent = playerNumber === index;
        
        if (isSetup) {
            content = username
        } else if (isBetting && isNil(bet)) {
            content = 'placing bet...';
        } else if (isBetting) {
            content = (
                <Done 
                    fontSize='large' 
                    style={{
                        fontSize: '3rem',
                        fill: 'limegreen',
                        filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0))'
                    }}
                />
            )
        } else if (isPlaying && trickCards[index]) {
            content = (
                <PlayingCard
                    {...trickCards[index]}
                    size='flexible'
                />
            )
        } else if (isPlaying && isActive && isCurrent) {
            content = 'it\'s your turn to pick a card...';
        } else if (isPlaying && isActive) {
            content = 'picking a card...';

        }
        return (
            <PlayerAvatar
                key={index}
                active={index === activePlayer}
                leader={trickLeader === index}
                player={index + 1}
            >
                {content}
            </PlayerAvatar>
        )
    });

    const handleCloseScoreBoard = () => {
        setBoardOpen(false);
    }

    return (
        <div 
            className={`
                game-board
                game-board--${isSetup ? MAX_NUMBER_OF_PLAYERS : players.length}-players
            `}
        >
            <header>
                {!isSetup && (
                    <>
                        <ul className='game-board__stats'>
                            <li>trump: {cardToString(trumpCard)}</li>
                            <li>round: {roundNumber + 1}</li>
                            <li>trick: {isBetting ? 'waiting for bets...' : trickNumber + 1}</li>
                        </ul>
                        <IconButton
                            size='small'
                            onClick={() => setBoardOpen(true)}
                        >
                            <ScoreBoardIcon
                                fontSize='large'
                            />
                        </IconButton>
                    </>
                )}
            </header>
            {avatars}
            <Fillers
                players={players.length}
                show={stage === 'awaiting-players'}
            />
            <footer>
                {(isSetup && playerNumber === 0) && (
                    <Button
                        variant='contained'
                        color='primary'
                    >
                        All players in
                    </Button>
                )}
            </footer>
            <ScoreBoard 
                open={scoreboardOpen}
                onClose={handleCloseScoreBoard}
            />
        </div>
    )
}

export {
    GameBoard,
}