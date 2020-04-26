import './index.scss';

import React, { useContext, ReactNode } from 'react';
import { PlayerAvatar } from '../Avatar';
import { GameContext } from '../../Context';
import isNil from 'lodash.isnil';
import { Done } from '@material-ui/icons';
import { PlayingCard } from '../PlayingCard';
import { Button, Typography } from '@material-ui/core';
import { GAME_STAGE, Card } from '../../types';
import { TrophyIcon } from '../../icons';

const MAX_NUMBER_OF_PLAYERS = 6;

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

interface GameBoardProps {
    onOpenBettingDialog: () => void;
}

function GameBoard(props: GameBoardProps) {
    const { onOpenBettingDialog } = props;
    const { 
        activePlayer,
        playerId,
        players,
        roundNumber,
        scores,
        stage,
        trickCards,
        trickLeader,
        ready,
        trickWinner,
    } = useContext(GameContext);
    
    const isSetup = stage === GAME_STAGE.SETTING_UP;
    const isPlaying = stage === GAME_STAGE.PLAYING;
    const isBetting = stage === GAME_STAGE.BETTING;
    const isBetweenTricks = stage === GAME_STAGE.BETWEEN_TRICKS;

    const avatars = players.map((username, index) => {
        const { bet } = scores[roundNumber]?.[username] ?? {};

        let content: ReactNode = null;
        const isActive = activePlayer === username;
        const isCurrent = playerId === username;
        
        if (isSetup) {
            content = (
                <Typography>{username}</Typography>
            )
        } else if (isBetting && isNil(bet) && isCurrent) {
            content = (
                <>
                <Button
                    onClick={onOpenBettingDialog}
                    color='primary'
                    variant='contained'
                >
                    Place bet
                </Button>
                {(trickLeader === username) && (
                    <Typography>(trick leader)</Typography>
                )}
                </>
            )
        } else if (isBetting && isNil(bet)) {
            content = (
                <>
                    <Typography>{username} is placing their bet...</Typography>
                    {(trickLeader === username) && (
                        <Typography>(trick leader)</Typography>
                    )}
                </>
                );
        } else if (isBetting) {
            content = (
                <>
                    {isCurrent ? 'you\'ve placed your bet' : `${username} has placed their bet`}
                    <Done 
                        fontSize='large' 
                        style={{
                            fontSize: '3rem',
                            fill: 'limegreen',
                            filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0))'
                        }}
                    />
                </>
            )
        } else if (isPlaying && trickCards[username]) {
            content = (
                <PlayingCard
                    {...trickCards[username] as Card}
                    size='flexible'
                />
            )
        } else if (isPlaying && isActive && isCurrent) {
            
            content = (
                <Typography>it's your turn to play a card...</Typography>
            );
        } else if (isPlaying && isActive) {
            content = (
                <Typography>{username} is playing a card...</Typography>
            )
        } else if (isBetweenTricks && playerId && !ready[playerId]) {
            content = (
                <PlayingCard
                    {...trickCards[username] as Card}
                    size='flexible'
                >
                    {username=== trickWinner && (
                        <TrophyIcon />
                    )}
                </PlayingCard>
            )
        } else if (isBetweenTricks && ready[username]) {
            content = (
                <>
                    {isCurrent ? 'you\'re ready' : `${username} is ready`}
                    <Done 
                        fontSize='large' 
                        style={{
                            fontSize: '3rem',
                            fill: 'limegreen',
                            filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0))'
                        }}
                    />
                </>
            )
        } else if (isBetweenTricks) {
            content = (
                <Typography>waiting for {username}...</Typography>
            )
        }
        return (
            <PlayerAvatar
                key={index}
                active={isActive}
                leader={trickLeader === username}
                player={index + 1}
            >
                {content}
            </PlayerAvatar>
        )
    });

    return (
        <div 
            className={`
                game-board
                game-board--${isSetup ? MAX_NUMBER_OF_PLAYERS : players.length}-players
            `}
        >
            {avatars}
            <Fillers
                players={players.length}
                show={stage === GAME_STAGE.SETTING_UP}
            />
        </div>
    )
}

export {
    GameBoard,
}