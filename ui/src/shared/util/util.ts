import { GameState } from '../models/state/gameState';

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
