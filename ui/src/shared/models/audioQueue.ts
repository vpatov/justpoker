
// TODO What to do if there is a global and a personal sound present? Just play the personal?
export declare interface AudioQueue {
    global: SoundByte;
    personal: SoundByte;
}

// sounds are global unless prefixed with PERSONAL
export enum SoundByte {
    NONE = "NONE",
    DEAL_CARDS = "DEAL_CARDS",
    CHECK = "CHECK",
    BET = "BET",
    FOLD = "FOLD",
    CALL = "CALL",
    CHAT = "CHAT",
    VICTORY = "VICTORY",
    HERO_TURN_TO_ACT = "HERO_TURN_TO_ACT",
    VICTORY_BY_FOLDING = "VICTORY_BY_FOLDING",
    START_OF_HAND = "START_OF_HAND",
    START_OF_BETTING_ROUND = "START_OF_BETTING_ROUND",

    PERSONAL_VICTORY = "PERSONAL_VICTORY"
}

export function getCleanAudioQueue(): AudioQueue {
    return {
            global: SoundByte.NONE,
            personal: SoundByte.NONE
    };
}
