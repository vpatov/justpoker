export declare interface BettingRoundAction {
    type: BettingRoundActionType;
    amount?: number;
}

// TODO re-evaluate semantics of WSAction vs BettingRoundAction vs lastActionType of Player
// and see if you can find a better design
export enum BettingRoundActionType {
    // distinction between bet and call may be unnecessary
    CALL = 'CALL',
    CHECK = 'CHECK',
    BET = 'BET',
    // distinction between bet and raise may be unnecessary
    // RAISE = 'RAISE',
    FOLD = 'FOLD',
    WAITING_TO_ACT = 'WAITING_TO_ACT',
    NOT_IN_HAND = 'NOT_IN_HAND',
    ALL_IN = 'ALL_IN',
    PLACE_BLIND = 'PLACE_BLIND',
}

export declare interface GameParameters {
    smallBlind: number;
    bigBlind: number;
    gameType: GameType;
    maxBuyin: number;
    timeToAct: number;

    // advanced params

    maxPlayers: number;
    dynamicMaxBuyin: boolean;
    maxBuyinType: MaxBuyinType;
    minBuyin: number;
    allowTimeBanks: boolean;
    timeBankTime: number;
    numberTimeBanks: number;
    allowStraddle: boolean;
    canShowHeadsUp: boolean;
}

export enum MaxBuyinType {
    TopStack = 'TopStack',
    HalfTopStack = 'HalfTopStack',
    SecondStack = 'SecondStack',
    AverageStack = 'AverageStack',
}

export enum StraddleType {
    NoStraddle = 'NoStraddle',
    MississipiStraddle = 'MississipiStraddle',
    NormalStraddle = 'NormalStraddle',
}

export enum GameType {
    LHOLDEM = 'LHOLDEM',
    NLHOLDEM = 'NLHOLDEM',
    PLOMAHA = 'PLOMAHA',
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

export function getBettingRoundStageIndex(bettingRoundStage: BettingRoundStage) {
    return BETTING_ROUND_STAGES.findIndex((stage) => stage === bettingRoundStage);
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

export function getCleanGameParameters() {
    return {
        smallBlind: 0,
        bigBlind: 0,
        gameType: GameType.NLHOLDEM,
        maxBuyin: 0,
        minBuyin: 0,
        dynamicMaxBuyin: false,
        maxBuyinType: MaxBuyinType.TopStack,
        timeToAct: 0,
        maxPlayers: 0,
        timeBankTime: 0,
        numberTimeBanks: 0,
        allowTimeBanks: false,
        allowStraddle: false,
        canShowHeadsUp: false,
    };
}

export function getDefaultGameParameters() {
    return {
        smallBlind: 1,
        bigBlind: 2,
        gameType: GameType.NLHOLDEM,
        maxBuyin: 200,
        minBuyin: 50,
        dynamicMaxBuyin: false,
        maxBuyinType: MaxBuyinType.TopStack,
        timeToAct: 30,
        maxPlayers: 9,
        timeBankTime: 30,
        numberTimeBanks: 5,
        allowTimeBanks: true,
        allowStraddle: false,
        canShowHeadsUp: false,
    };
}
