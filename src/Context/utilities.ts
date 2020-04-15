import { PlayerId } from "../types";
import isEqual from 'lodash.isequal';

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
    return sessionStorage.getItem(`game-${gameCode}`);
}

const setPlayerId = (gameCode: string | null, playerId: PlayerId) => {
    sessionStorage.setItem(`game-${gameCode}`, playerId);
}

/**
 * returns an array less the first occurence of the item
 * @param array array to remove item from
 * @param item item to remove
 */
function removeFirst<T = any>(array: T[], item: any): T[] {
    let removed = false;
    return array.filter((itemToCheck) => {
        if (!removed) {
            if (isEqual(item, itemToCheck)) {
                removed = true;
                return false;
            }
        }
        return true
    })
}

export {
    createReducer,
    setQueryStringParam,
    getPlayerId,
    setPlayerId,
    removeFirst,
}