import { Suit, genRandomCard } from "./cards";
import { ActionType } from "./wsaction";
import { genRandomInt } from "../util/util";
import { AudioQueue, getCleanAudioQueue } from "./audioQueue";
import { ChatMessage } from "./chat";

export declare interface UiState {
    game: UiGameState;
    audio: AudioQueue;
    chat: UiChatMessage;
}

export declare interface UiGameState {
    controller: Controller;
    table: Table;
    players: Player[];
    heroIsSeated: boolean;
    gameStarted: boolean;
}

export declare interface Controller {
    min: number;
    max: number;
    sizingButtons: SizingButton[];
    actionButtons: ActionButton[];
    adminButtons?: ActionButton[];

    toAct?: boolean;
    unsetQueuedAction?: boolean;
}

export declare interface SizingButton {
    label: string;
    value: number;
}

export declare interface ActionButton {
    label: string;
    action: ActionType;
    disabled?: boolean;
}

export declare interface UiCard {
    suit?: Suit;
    rank?: string;
    hidden?: boolean;
}

export declare interface Table {
    spots: number;
    pot: number;
    readonly communityCards: UiCard[];
}

export declare interface PlayerTimer {
    timeElapsed: number;
    timeLimit: number;
}

export declare interface Player {
    name: string;
    position: number;
    stack: number;
    uuid?: string;
    hero?: boolean;
    folded?: boolean;
    toAct?: boolean;
    button?: boolean;
    winner?: boolean;
    bet?: number;
    handLabel?: string;
    playerTimer?: PlayerTimer;
    hand: {
        cards: UiCard[];
    };
}

export declare interface UiChatMessage {
    timestamp: number;
    content: string;
    senderName: string;
    playerUUID?: string;
}

export declare interface UiChatLog {
    messages: UiChatMessage[];
}

/* Action Buttons */
export const FOLD_BUTTON: ActionButton = {
    action: ActionType.FOLD,
    label: "Fold",
};

export const CHECK_BUTTON: ActionButton = {
    action: ActionType.CHECK,
    label: "Check",
};

export const CALL_BUTTON: ActionButton = {
    action: ActionType.CALL,
    label: "Call",
};

export const BET_BUTTON: ActionButton = {
    action: ActionType.BET,
    label: "Bet",
};

export const RAISE_BUTTON: ActionButton = {
    action: ActionType.BET,
    label: "Raise",
};

export const START_GAME_BUTTON = {
    action: ActionType.STARTGAME,
    label: "Start Game",
};

export const STOP_GAME_BUTTON = {
    action: ActionType.STOPGAME,
    label: "Stop Game",
};

export const ADD_CHIPS_BUTTON = {
    action: ActionType.ADDCHIPS,
    label: "Add Chips",
};

export const NOT_FACING_BET_ACTION_BUTTONS = [
    FOLD_BUTTON,
    CHECK_BUTTON,
    BET_BUTTON,
];

export const FACING_BET_ACTION_BUTTONS = [
    FOLD_BUTTON,
    CALL_BUTTON,
    RAISE_BUTTON,
];

export const ALL_ACTION_BUTTONS = [FOLD_BUTTON, CALL_BUTTON, BET_BUTTON];

/* Common bet sizes */
export const COMMON_BB_SIZINGS: Array<number> = [2, 3, 4, 5];

export const COMMON_POT_SIZINGS: Array<[number, number]> = [
    [1, 3],
    [1, 2],
    [2, 3],
    [1, 1],
    [5, 4],
];

export const cleanUiChatLog: UiChatLog = {
    messages: [],
};

/* Clean Controller for init. */
export const cleanController: Controller = {
    toAct: false,
    unsetQueuedAction: false,
    min: 0,
    max: 0,
    sizingButtons: [],
    actionButtons: [],
    adminButtons: [],
};

export const CleanGame: UiGameState = {
    heroIsSeated: false,
    gameStarted: false,
    controller: {
        toAct: false,
        unsetQueuedAction: false,
        min: 0,
        max: 0,
        sizingButtons: [],
        actionButtons: [],
    },
    table: {
        spots: 9,
        pot: 0,
        communityCards: [],
    },
    players: [],
};

export const CleanRootState: UiState = {
    game: CleanGame,
    audio: getCleanAudioQueue(),
    chat: {
        senderName: "Vasia",
        content: "Message in the chat log.",
        timestamp: 0,
    },
};

export const testUiChatLog: UiChatLog = {
    messages: [
        {
            senderName: "Vasia",
            content: "Message in the chat log.",
            timestamp: 0,
        },
        {
            senderName: "Jules",
            content: "witty response to something clever.",
            timestamp: 0,
        },
        {
            senderName: "ShaemusGoatmaster",
            content:
                "Message in the chataaaasssssssssss sadasdasd asdasd lots of words lorem ipsum lorel sdfsdf log.",
            timestamp: 0,
        },
    ],
};

export const TestGame: UiGameState = {
    heroIsSeated: true,
    gameStarted: true,
    controller: {
        toAct: true,
        unsetQueuedAction: false,
        min: 25,
        max: 43000,
        sizingButtons: [
            {
                label: "1/2",
                value: 6000,
            },
            {
                label: "3/4",
                value: 9000,
            },
            {
                label: "Pot",
                value: 12000,
            },
            {
                label: "All In",
                value: 43000,
            },
        ],
        actionButtons: ALL_ACTION_BUTTONS,
        adminButtons: [START_GAME_BUTTON],
    },
    table: {
        spots: 9,
        pot: 12000,

        communityCards: [
            genRandomCard(),
            genRandomCard(),
            genRandomCard(),
            genRandomCard(),
            genRandomCard(),
        ],
    },
    players: [
        {
            name: "Rick Dolo",
            position: 0,
            stack: 5500,
            toAct: true,
            handLabel: "Set of Kings",
            playerTimer: {
                timeElapsed: 7.6,
                timeLimit: 30,
            },
            bet: genRandomInt(0, 10),
            hand: {
                cards: [genRandomCard(), genRandomCard()],
            },
        },
        {
            name: "Marty Shakus",
            position: 1,
            stack: 425323,
            bet: genRandomInt(0, 100),
            handLabel: "Four of a Kind",
            hand: {
                cards: [genRandomCard(), genRandomCard()],
            },
        },
        {
            name: "Dean Markus",
            position: 2,
            stack: 323,
            bet: genRandomInt(0, 1000),
            handLabel: "Straight Flush",
            hand: {
                cards: [{ hidden: true }, { hidden: true }],
            },
        },
        {
            name: "Johnny Bones",
            position: 3,
            stack: 323,
            hand: {
                cards: [genRandomCard(), genRandomCard()],
            },
        },

        {
            button: true,
            name: "Langus Yanger",
            position: 4,
            stack: 323,
            bet: genRandomInt(0, 100000),
            handLabel: "Top Two",
            hand: {
                cards: [genRandomCard(), genRandomCard()],
            },
        },
        {
            name: "Tommy Bones",
            position: 5,
            stack: 323,

            hand: {
                cards: [genRandomCard(), genRandomCard()],
            },
        },
        {
            hero: true,
            name: "Jimmy Dean",
            position: 6,
            stack: 43020,
            bet: genRandomInt(0, 1000000),
            handLabel: "Three Queens",
            hand: {
                cards: [genRandomCard(), genRandomCard()],
            },
        },
        {
            name: "Nicki Lam",
            stack: 20499,
            position: 7,
            bet: genRandomInt(0, 100000000),
            hand: {
                cards: [genRandomCard(), genRandomCard()],
            },
        },
        {
            name: "Tommy Bones",
            position: 8,
            stack: 323,
            folded: true,
            hand: {
                cards: [genRandomCard(), genRandomCard()],
            },
        },
    ],
};
