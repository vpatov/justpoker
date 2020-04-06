import { Card } from './cards';

export declare interface GamePlayAction {
    actionType: GamePlayActionType;
    amount: number;
}

export const enum GamePlayActionType {
    CHECK = 'CHECK',
    BET = 'BET',
    RAISE = 'RAISE',
    FOLD = 'FOLD',
}

export declare interface GameParameters {
    smallBlind: number;
    bigBlind: number;
    gameType: GameType;
    timeToAct: number;
    maxPlayers: number;
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