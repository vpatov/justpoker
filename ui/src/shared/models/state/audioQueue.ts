// TODO we most likely dont need "global" and "personal",
// because it seems like there will only be one sound per client per wsmessage
export declare interface AudioQueue {
    global: SoundByte;
    personal: { [playerUUID: string]: SoundByte };
    // personal: SoundByte;
}

export enum SoundByte {
    NONE = 'NONE',
    // DEAL_CARDS = "DEAL_CARDS",
    CHECK = 'CHECK',
    BET = 'BET',
    FOLD = 'FOLD',
    CALL = 'CALL',
    // CHAT = "CHAT",
    HERO_WIN = 'HERO_WIN',
    // BIG_HERO_WIN="BIG_HERO_WIN",
    TIMER_WARNING = 'TIMER_WARNING',
    VILLAIN_WIN = 'VILLAIN_WIN',
    HERO_TO_ACT = 'HERO_TO_ACT',
    START_OF_HAND = 'START_OF_HAND',
    FLOP = 'FLOP',
    TURN_RIVER = 'TURN_RIVER',
    // START_OF_BETTING_ROUND = "START_OF_BETTING_ROUND",
}

export function getCleanAudioQueue(): AudioQueue {
    return {
        global: SoundByte.NONE,
        personal: {},
    };
}
