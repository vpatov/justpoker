import { Card } from './cards';

export declare interface Player {
    name: string;
    chips: number;
    holeCards: Card[];
    sitting: boolean;
    uuid: string;
}

/*
export declare interface PlayerGameData {
    // holeCards: Card[];
    // gameData: PlayerGameData;
    // potsWon: number;
    // vpip: number;
}
*/