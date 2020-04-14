import { PlayerId } from "../types";

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

const getPlayerId = (gameCode: string) => {
    return localStorage.getItem(`game-${gameCode}`);
}

const setPlayerId = (gameCode: string | null, playerId: PlayerId) => {
    localStorage.setItem(`game-${gameCode}`, playerId);
}

export {
    createReducer,
    setQueryStringParam,
    getPlayerId,
    setPlayerId,
}