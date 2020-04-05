import { Card } from './cards';

export declare interface GameParameters {
    smallBlind: number;
    bigBlind: number;
    gameType: GameType;
    // add these later
    // straddleType: StraddleType;
    // ante: number;
}

export const enum StraddleType {
    NoStraddle = "NoStraddle",
    MississipiStraddle = "MississipiStraddle",
    NormalStraddle = "NormalStraddle",
}

// These are the community cards
export declare interface Board {
    cards: Card[]
}

export const enum GameType {
    LHOLDEM = 'LHOLDEM',
    NLHOLDEM = 'NLHOLDEM',
    PLOMAHA = 'PLOMAHA',
}

// The usage of this enum might need to change
// if expanding app to beyond nlholdem and plo
export const enum BettingRound {
    WAITING = 'WAITING',
    PREFLOP = 'PREFLOP',
    FLOP = 'FLOP',
    TURN = 'TURN',
    RIVER = 'RIVER',
}

export declare interface NewTableForm {
    hostName: string;
    smallBlind: number;
    bigBlind: number;
    gameType: GameType;
    hostStack: number;
}