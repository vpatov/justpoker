import { Card } from './cards';

export declare interface BettingRoundAction {
    type: BettingRoundActionType;
    amount: number;
    allin: boolean;
}

export const enum BettingRoundActionType {
    CALL = 'CALL',
    CHECK = 'CHECK',
    BET = 'BET',
    // distinction between bet and raise may be unnecessary
    // RAISE = 'RAISE',
    FOLD = 'FOLD',
    WAITING_TO_ACT = 'WAITING_TO_ACT',
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
export const enum BettingRoundStage {
    WAITING = 'WAITING',
    PREFLOP = 'PREFLOP',
    FLOP = 'FLOP',
    TURN = 'TURN',
    RIVER = 'RIVER',
    SHOWDOWN = 'SHOWDOWN',
}

export const BETTING_ROUND_STAGES = [
    BettingRoundStage.WAITING,
    BettingRoundStage.PREFLOP,
    BettingRoundStage.FLOP,
    BettingRoundStage.TURN,
    BettingRoundStage.RIVER,
    BettingRoundStage.SHOWDOWN,
];

export const CHECK_ACTION: BettingRoundAction = {
    type: BettingRoundActionType.CHECK,
    amount: 0,
    allin: false
};

export const FOLD_ACTION: BettingRoundAction = {
    type: BettingRoundActionType.FOLD,
    amount: 0,
    allin: false
};

export const WAITING_TO_ACT: BettingRoundAction = {
    type: BettingRoundActionType.WAITING_TO_ACT,
    amount: 0,
    allin: false
};

