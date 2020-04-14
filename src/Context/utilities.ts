type handler<T> = (state: T, payload: any) => T;

function createReducer<S>(
    handlers: { [key: string]: handler<S> },
) {
    return (state: S, currAction: { type: string; payload?: any }) => {
        if (Object.prototype.hasOwnProperty.call(handlers, currAction.type)) {
            return (handlers[currAction.type](state, currAction.payload));
        }
        return state;
    };
}

const setQueryStringParam = (key: string, value: unknown) => {
    const params = new URLSearchParams(window.location.search);
    params.append(key, String(value));
    window.location.search = params.toString();
}

const getPlayerNumber = (gameCode: string) => {
    const playerNumber = localStorage.getItem(`game-${gameCode}`);
    return playerNumber ? Number(playerNumber) : null;
}

const setPlayerNumber = (gameCode: string | null, playerNumber: number) => {
    localStorage.setItem(`game-${gameCode}`, String(playerNumber));
}

export {
    createReducer,
    setQueryStringParam,
    getPlayerNumber,
    setPlayerNumber,
}