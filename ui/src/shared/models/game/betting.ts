import { PlayerUUID } from '../system/uuid';

export declare interface BettingRoundAction {
    type: BettingRoundActionType;
    amount?: number;
}

// TODO re-evaluate semantics of WSAction vs BettingRoundAction vs lastActionType of Player
// and see if you can find a better design
export enum BettingRoundActionType {
    CALL = 'CALL',
    CHECK = 'CHECK',
    CHECK_FOLD = 'CHECK_FOLD',
    BET = 'BET',
    FOLD = 'FOLD',
    WAITING_TO_ACT = 'WAITING_TO_ACT',
    NOT_IN_HAND = 'NOT_IN_HAND',
    ALL_IN = 'ALL_IN',
    PLACE_BLIND = 'PLACE_BLIND',
}

// The usage of this enum might need to change
// if expanding app to beyond nlholdem and plo
export enum BettingRoundStage {
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

export declare interface Pot {
    value: number;
    contestors: Array<PlayerUUID>;
}

export const CHECK_ACTION: BettingRoundAction = {
    type: BettingRoundActionType.CHECK,
};

export const FOLD_ACTION: BettingRoundAction = {
    type: BettingRoundActionType.FOLD,
};

export const WAITING_TO_ACT: BettingRoundAction = {
    type: BettingRoundActionType.WAITING_TO_ACT,
};

export const CALL_ACTION: BettingRoundAction = {
    type: BettingRoundActionType.CALL,
};

export const NOT_IN_HAND: BettingRoundAction = {
    type: BettingRoundActionType.NOT_IN_HAND,
};

export const ALL_BETTING_ROUND_ACTION_TYPES: BettingRoundActionType[] = [
    BettingRoundActionType.CHECK,
    BettingRoundActionType.FOLD,
    BettingRoundActionType.BET,
    BettingRoundActionType.CALL,
];

export function getBettingRoundStageIndex(bettingRoundStage: BettingRoundStage) {
    return BETTING_ROUND_STAGES.findIndex((stage) => stage === bettingRoundStage);
}
