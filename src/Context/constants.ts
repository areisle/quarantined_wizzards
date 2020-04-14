const API = process.env.REACT_APP_API as string;

enum USER_EVENTS {
    START_GAME = 'start-game',
    CREATE_GAME = 'create-game',
    PLAY_CARD = 'play-card',
    JOIN_GAME = 'join-game',
    PLACE_BET = 'place-bet',
    
    REJOIN_GAME = 'rejoin-game',
    GET_PLAYERS = 'get-users',
}

enum SERVER_EVENTS {
    TRUMP_CHANGED = 'trump-changed',
    ACTIVE_PLAYER_CHANGED = 'active-user-changed',
    TRICK_WON = 'trick-won',
    CARD_PLAYED = 'card-played',
    PLAYERS_CHANGED = 'users-changed',
    ROUND_STARTED = 'round-started',
    TRICK_STARTED = 'trick-started',
    BET_PLACED = 'bet-placed',
    ERROR = 'error',
}

export {
    API,
    USER_EVENTS,
    SERVER_EVENTS,
}