export declare interface GameExp {
    sounds: Sounds;
}

export declare interface Sounds {
    global: SoundsAction;
}

export enum SoundsAction {
    NONE = "NONE",
    DEAL = "STARTGAME",
    CHECK = "CHECK",
    BET = "BET",
    FOLD = "FOLD",
    CALL = "CALL",
    CHAT = "CHAT",
}

export function genCleanGameExp(): GameExp {
    return {
        sounds: {
            global: SoundsAction.NONE,
        },
    };
}
