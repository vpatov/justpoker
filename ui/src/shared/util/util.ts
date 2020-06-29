import util from 'util';
import { GameState } from '../models/state/gameState';
import { HTTPParams } from '../models/api/api';
import queryString from 'query-string';
import { GameInstanceUUID } from '../models/system/uuid';

export function printObj(obj: any) {
    console.log(util.inspect(obj, false, null, true));
}

// Returns a random integer between min (inclusive) and max (inclusive)
export function genRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getLoggableGameState(gameState: GameState) {
    const minimizedGameState = {
        ...gameState,
    };
    return JSON.stringify(minimizedGameState);
}

export function parseHTTPParams(parsedQuery: queryString.ParsedUrl) {
    const queryParams: HTTPParams = {
        gameInstanceUUID: parsedQuery.query.gameInstanceUUID as GameInstanceUUID,
    };
    return queryParams;
}

export function getEpochTimeMs(): number {
    return Date.now();
}
