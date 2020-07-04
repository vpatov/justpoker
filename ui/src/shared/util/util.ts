import util from 'util';
import { GameState } from '../models/state/gameState';

export function printObj(obj: any) {
    console.log(util.inspect(obj, false, null, true));
}

export function shuffle<T>(array: Array<T>): void  {
    let j: number, temp: T, i: number;
    for (i = array.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
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

export function getEpochTimeMs(): number {
    return Date.now();
}
