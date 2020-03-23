import { Card } from './cards';

export declare interface Player {
    name: string;
    uuid: string;
    gameData?: PlayerGameData;
}

export declare interface PlayerGameData {
    chips: number;
    holeCards: Card[];
    // potsWon: number;
    // vpip: number;
}