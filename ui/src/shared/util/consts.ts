

export const MIN_VALUES = {
    TIME_TO_ACT: 1,
    BIG_BLIND: 1,
    SMALL_BLIND: 1,
    BUY_IN: 1,
    PLAYER_STACK: 0,
}

export const MAX_VALUES = {
    TIME_TO_ACT: 60 * 10, // 10 minutes
    BIG_BLIND: Math.pow(10, 8),
    SMALL_BLIND: Math.pow(10, 8),
    BUY_IN: Math.pow(10, 9),
    PLAYER_STACK: Math.pow(10, 9),
}