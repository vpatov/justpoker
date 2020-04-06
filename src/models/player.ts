import { Card } from './cards';
import { GamePlayAction } from './game';

export declare interface Player {
    name: string;
    chips: number;
    holeCards: Card[];
    inHand: boolean;
    sitting: boolean;
    uuid: string;
    seatNumber: number;
    lastAction: GamePlayAction | null;
}

/*
export declare interface PlayerGameData {
    // holeCards: Card[];
    // gameData: PlayerGameData;
    // potsWon: number;
    // vpip: number;
}
*/