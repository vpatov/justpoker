
export declare interface AudioQueue {
    global: SoundByte;
}

export enum SoundByte {
    NONE = "NONE",
    DEAL_CARDS = "DEAL_CARDS",
    CHECK = "CHECK",
    BET = "BET",
    FOLD = "FOLD",
    CALL = "CALL",
    CHAT = "CHAT",
    VICTORY = "VICTORY",
    HERO_TURN_TO_ACT = "HERO_TURN_TO_ACT"
}

export function getCleanAudioQueue(): AudioQueue {
    return {
            global: SoundByte.NONE,
    };
}
