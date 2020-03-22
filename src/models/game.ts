export declare interface GameParameters {
    smallBlind: number;
    bigBlind: number;
    straddleType: StraddleType;
    ante: number;
}

// TODO learn about other types of poker, and learn how they are
// diffrent from texas hold em, and figure out where it would be best to
// capture logic differences. Can the game type go into game parameters?

export declare enum StraddleType {
    NoStraddle,
    MississipiStraddle,
    NormalStraddle
}