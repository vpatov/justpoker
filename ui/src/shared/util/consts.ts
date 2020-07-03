export const JP_VERSION = '0.1.0';

export const MIN_VALUES = {
    TIME_TO_ACT: 1,
    BIG_BLIND: 1,
    SMALL_BLIND: 1,
    BUY_IN: 1,
    PLAYER_STACK: 0,
    MAX_PLAYERS: 2,
    NUMBER_TIME_BANKS: 1,
    TIME_BANK_TIME: 1,
    TIME_BANK_REPLENISH_INTERVAL: 1,
};

export const MAX_VALUES = {
    TIME_TO_ACT: 60 * 10, // 10 minutes
    BIG_BLIND: Math.pow(10, 8),
    SMALL_BLIND: Math.pow(10, 8),
    BUY_IN: Math.pow(10, 9),
    PLAYER_STACK: Math.pow(10, 9),
    MAX_PLAYERS: 9,
    NUMBER_TIME_BANKS: 100,
    TIME_BANK_TIME: 60 * 10, // 10 minutes
    TIME_BANK_REPLENISH_INTERVAL: Math.pow(10,5),
};

export const EXPIRE_CLIENT_INTERVAL = 1000 * 60 * 10; // 10 minutes
export const ATTEMPT_EXPIRE_CLIENT_INTERVAL = 1000 * 60 * 15; // 15 minutes

export const WS_NORMAL_CLOSE = 1000;
