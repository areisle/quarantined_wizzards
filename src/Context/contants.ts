const API = process.env.REACT_APP_API as string;

enum USER_EVENTS {
    START_GAME = 'start-game',
    CREATE_GAME = 'create-game',
    PLAY_CARD = 'play-card',
    JOIN_GAME = 'join-game',
    REJOIN_GAME = 'rejoin-game',
    PLACE_BET = 'place-bet',

    // get users (without having joined yet)
}

enum SERVER_EVENTS {
    TRUMP_CHANGED = 'trump-changed',
    ACTIVE_PLAYER_CHANGED = 'active-user-changed',
    CARDS_DEALT = 'cards-dealt',
    TRICK_WON = 'trick-won',
    CARD_PLAYED = 'card-played',
    PLAYERS_CHANGED = 'users-changed',

    // wanted events
    ROUND_STARTED = 'round-started',
    TRICK_STARTED = 'trick-started',
    BET_PLACED = 'bet-placed',
}

export {
    API,
    USER_EVENTS,
    SERVER_EVENTS,
}