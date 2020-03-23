import { Card } from './cards';

export declare interface GameParameters {
    smallBlind: number;
    bigBlind: number;
    // add these later
    // straddleType: StraddleType;
    // ante: number;
}

// TODO learn about other types of poker, and learn how they are
// diffrent from texas hold em, and figure out where it would be best to
// capture logic differences. Can the game type go into game parameters?

export const enum StraddleType {
    NoStraddle = "NoStraddle",
    MississipiStraddle = "MississipiStraddle",
    NormalStraddle = "NormalStraddle",
}

export declare interface Board {
    cards: Card[]
}


export const enum GameType {
    LimitTexasHoldEm = 'LimitTexasHoldEm',
    NoLimitTexasHoldEm = 'NoLimitTexasHoldEm',
    PotLimitOmaha = 'PotLimitOmaha',
}