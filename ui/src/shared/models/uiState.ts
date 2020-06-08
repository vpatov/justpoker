import { Suit, genRandomCard } from './cards';
import { ClientActionType, UiActionType } from './api';
import { genRandomInt } from '../util/util';
import { SoundByte } from './audioQueue';
import { AnimationState, getCleanAnimationState } from './animationState';
import { UserPreferences } from './userPreferences';

import { MAX_VALUES } from '../util/consts';
import {
    BettingRoundActionType,
    BettingRoundAction,
    NOT_IN_HAND,
    CHECK_ACTION,
    GameParameters,
    getCleanGameParameters,
    getDefaultGameParameters,
} from './game';
import { PlayerUUID, makeBlankUUID } from './uuid';
import { getRandomAvatarKey, AvatarKeys } from './assets';

export declare interface ErrorDisplay {
    message?: string;
    redirect?: { url: string; text: string };
}

export declare interface Error {
    error: ErrorDisplay;
}

export function getDefaultGame404(): Error {
    return {
        error: {
            message: 'No game exists at this url.',
            redirect: { url: '/', text: 'Create Game' },
        },
    };
}
export declare interface UiState {
    game: UiGameState;
    audio: SoundByte;
    chat: UiChatMessage;
    animation: AnimationState;
    userPreferences?: UserPreferences;
}

export declare interface UiGameState {
    global: Global;
    controller: Controller;
    table: Table;
    players: UiPlayer[];
    menu: MenuButton[];
    gameParameters: GameParameters;
}

export declare interface Global {
    heroIsAdmin: boolean;
    heroIsSeated: boolean;
    isGameInProgress: boolean;
    canStartGame: boolean;
    gameWillStopAfterHand: boolean;
    unqueueAllBettingRoundActions: boolean;
    areOpenSeats: boolean;
    gameParametersWillChangeAfterHand: boolean;
    computedMaxBuyin: number;
}

export declare interface Controller {
    min: number;
    max: number;
    timeBanks: number;
    sizingButtons: SizingButton[];
    bettingRoundActionButtons: BettingRoundActionButton[];
    showCardButtons?: ShowCardButton[];
    dealInNextHand: boolean;
    toAct?: boolean;
    willStraddle: boolean;
    lastBettingRoundAction: BettingRoundAction;
    showWarningOnFold: boolean;
    callAmount: number;
    playerPositionString?: string;
}

export declare interface SizingButton {
    label: string;
    value: number;
}

export declare interface ActionButton {
    label: string;
    action: ClientActionType;
    disabled?: boolean;
}

export declare interface BettingRoundActionButton {
    label: string;
    action: BettingRoundActionType;
    disabled?: boolean;
}

export declare interface MenuButton {
    label: string;
    action: ClientActionType | UiActionType;
}

export declare interface ShowCardButton {
    suit: Suit;
    rank: string;
}

export declare interface UiCard {
    suit?: Suit;
    rank?: string;
    hidden?: boolean;
    partOfWinningHand?: boolean;
}

export declare interface Table {
    spots: number;
    activePot: number;
    fullPot: number;
    inactivePots?: number[];
    awardPots?: AwardPot[];
    readonly communityCards: UiCard[];
    winningHandDescription?: string;
}

export declare interface AwardPot {
    winnerUUID: PlayerUUID;
    value: number;
}

export declare interface PlayerTimer {
    timeElapsed: number;
    timeLimit: number;
}

export declare interface UiPlayer {
    name: string;
    position: number;
    stack: number;
    uuid?: string;
    hero?: boolean;
    sittingOut?: boolean;
    quitting?: boolean;
    folded?: boolean;
    toAct?: boolean;
    positionIndicator?: PositionIndicator;
    winner?: boolean;
    bet?: number;
    handLabel?: string;
    playerTimer?: PlayerTimer;
    hand: {
        cards: UiCard[];
    };
    avatarKey: AvatarKeys;
}

export enum PositionIndicator {
    BUTTON = 'BUTTON',
    BIG_BLIND = 'BIG_BLIND',
    SMALL_BLIND = 'SMALL_BLIND',
}

export declare interface UiChatMessage {
    timestamp: number;
    content: string;
    senderName: string;
    playerUUID: PlayerUUID;
    seatNumber: number;
}

export declare interface UiChatLog {
    messages: UiChatMessage[];
}

/* Action Buttons */
export const FOLD_BUTTON: BettingRoundActionButton = {
    action: BettingRoundActionType.FOLD,
    label: 'Fold',
};

export const CHECK_BUTTON: BettingRoundActionButton = {
    action: BettingRoundActionType.CHECK,
    label: 'Check',
};

export const CALL_BUTTON: BettingRoundActionButton = {
    action: BettingRoundActionType.CALL,
    label: 'Call',
};

export const BET_BUTTON: BettingRoundActionButton = {
    action: BettingRoundActionType.BET,
    label: 'Bet',
};

export const RAISE_BUTTON: BettingRoundActionButton = {
    action: BettingRoundActionType.BET,
    label: 'Raise',
};

export const START_GAME_BUTTON: MenuButton = {
    action: ClientActionType.STARTGAME,
    label: 'Start Game',
};

export const STOP_GAME_BUTTON: MenuButton = {
    action: ClientActionType.STOPGAME,
    label: 'Stop Game',
};

export const LEAVE_TABLE_BUTTON: MenuButton = {
    action: ClientActionType.LEAVETABLE,
    label: 'Leave Table',
};

export const VOLUME_BUTTON: MenuButton = {
    action: UiActionType.VOLUME,
    label: 'Mute',
};

export const USER_SETTINGS_BUTTON: MenuButton = {
    action: UiActionType.USER_SETTINGS,
    label: 'User Settings',
};

export const GAME_SETTINGS_BUTTON: MenuButton = {
    action: UiActionType.GAME_SETTINGS,
    label: 'Game Settings',
};

export const LEDGER_BUTTON: MenuButton = {
    action: UiActionType.OPEN_LEDGER,
    label: 'Ledger',
};

export const NOT_FACING_BET_ACTION_BUTTONS = [FOLD_BUTTON, CHECK_BUTTON, BET_BUTTON];

export const FACING_BET_ACTION_BUTTONS = [FOLD_BUTTON, CALL_BUTTON, RAISE_BUTTON];

export const ALL_ACTION_BUTTONS = [FOLD_BUTTON, CALL_BUTTON, BET_BUTTON];

export const ALL_MENU_BUTTONS = [
    START_GAME_BUTTON,
    STOP_GAME_BUTTON,
    LEAVE_TABLE_BUTTON,
    VOLUME_BUTTON,
    USER_SETTINGS_BUTTON,
    GAME_SETTINGS_BUTTON,
];

/* Common bet sizes */
export const COMMON_BB_SIZINGS: Array<number> = [3, 4, 5];

export const COMMON_POT_SIZINGS: Array<[number, number]> = [
    [1, 3],
    [2, 3],
];

export function getCleanUiChatLog(): UiChatLog {
    return { messages: [] };
}

/* Clean Controller for init. */
export function getCleanController(): Controller {
    return {
        toAct: false,
        lastBettingRoundAction: NOT_IN_HAND,
        min: 0,
        max: 0,
        willStraddle: false,
        dealInNextHand: true,
        sizingButtons: [],
        bettingRoundActionButtons: [],
        timeBanks: 0,
        showWarningOnFold: false,
        callAmount: 0,
    };
}

export function getCleanGlobal(): Global {
    return {
        heroIsAdmin: false,
        heroIsSeated: false,
        isGameInProgress: false,
        canStartGame: false,
        gameWillStopAfterHand: false,
        gameParametersWillChangeAfterHand: false,
        unqueueAllBettingRoundActions: true,
        areOpenSeats: true,
        computedMaxBuyin: 1,
    };
}

export function getCleanGame(): UiGameState {
    return {
        global: getCleanGlobal(),
        controller: getCleanController(),
        menu: [],
        table: {
            spots: 9,
            activePot: 0,
            fullPot: 0,
            communityCards: [],
        },
        players: [],
        gameParameters: getCleanGameParameters(),
    };
}

export function getCleanChatMessage(): UiChatMessage {
    return {
        senderName: '',
        content: '',
        timestamp: 0,
        playerUUID: makeBlankUUID(),
        seatNumber: 0,
    };
}

export const CleanRootState: UiState = {
    game: getCleanGame(),
    audio: SoundByte.NONE,
    chat: getCleanChatMessage(),
    animation: getCleanAnimationState(),
};

export const testUiChatLog: UiChatLog = {
    messages: [
        {
            senderName: 'Vasia',
            content: 'Message in the chat log.',
            timestamp: 0,
            playerUUID: '123' as PlayerUUID,
            seatNumber: 0,
        },
        {
            senderName: 'Jules',
            content: 'witty response to something clever.',
            timestamp: 0,
            playerUUID: '234' as PlayerUUID,
            seatNumber: 1,
        },
        {
            senderName: 'ShaemusGoatmaster',
            content: 'Message in the chataaaasssssssssss sadasdasd asdasd lots of words lorem ipsum lorel sdfsdf log.',
            timestamp: 0,
            playerUUID: '345' as PlayerUUID,
            seatNumber: 2,
        },
    ],
};

function shuffle(a: any) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
shuffle(positions);

export const TestGame: UiGameState = {
    menu: ALL_MENU_BUTTONS,
    gameParameters: getDefaultGameParameters(),
    global: {
        heroIsSeated: true,
        heroIsAdmin: true,
        isGameInProgress: true,
        canStartGame: false,
        gameWillStopAfterHand: true,
        unqueueAllBettingRoundActions: true,
        areOpenSeats: true,
        gameParametersWillChangeAfterHand: true,
        computedMaxBuyin: 1000,
    },
    controller: {
        showWarningOnFold: true,
        toAct: true,
        lastBettingRoundAction: CHECK_ACTION,
        min: 25,
        max: 43000,
        callAmount: 54323,
        timeBanks: 2,
        dealInNextHand: false,
        playerPositionString: 'Hijack',
        showCardButtons: [
            { rank: genRandomCard().rank, suit: genRandomCard().suit },
            { rank: genRandomCard().rank, suit: genRandomCard().suit },
            { rank: genRandomCard().rank, suit: genRandomCard().suit },
            { rank: genRandomCard().rank, suit: genRandomCard().suit },
        ],
        willStraddle: true,
        sizingButtons: [
            {
                label: 'Min',
                value: 25,
            },
            {
                label: '1/3',
                value: 6000,
            },
            {
                label: '2/3',
                value: 9000,
            },
            {
                label: 'Pot',
                value: 12000,
            },
            {
                label: 'All In',
                value: 43000,
            },
        ],
        bettingRoundActionButtons: ALL_ACTION_BUTTONS,
    },
    table: {
        spots: 9,
        activePot: genRandomInt(0, 1000000),
        fullPot: genRandomInt(0, 10000),
        inactivePots: [100000, 10000].map((p) => genRandomInt(0, p)),
        awardPots: [
            { winnerUUID: 'TEST_UUID_1' as PlayerUUID, value: genRandomInt(0, 100000) },
            // { winnerUUID: 'TEST_UUID_2', value: genRandomInt(0, 100000) },
        ],
        communityCards: [
            { ...genRandomCard(), partOfWinningHand: true },
            { ...genRandomCard(), partOfWinningHand: true },
            { ...genRandomCard(), partOfWinningHand: true },
            { rank: 'T', suit: Suit.CLUBS },
            genRandomCard(),
        ],
        winningHandDescription: 'Full House, Queens over Threes',
    },
    players: [
        {
            name: 'Rick Dolo',
            position: positions[0],
            stack: 5500,
            hero: true,
            toAct: true,
            playerTimer: {
                timeElapsed: 11.5,
                timeLimit: 30,
            },
            handLabel: 'Full House, Queens over Threes',
            bet: genRandomInt(0, 10),
            hand: {
                cards: [{ ...genRandomCard() }, genRandomCard()],
            },
            avatarKey: getRandomAvatarKey(),
        },
        {
            name: 'Marty Shakus',
            position: positions[1],
            stack: 425320,
            uuid: 'TEST_UUID_1',
            quitting: true,
            bet: genRandomInt(0, 100),
            hand: {
                cards: [{ hidden: true }, { hidden: true }, { hidden: true }, { hidden: true }],
            },
            avatarKey: getRandomAvatarKey(),
        },
        {
            name: 'Dean Markus',
            position: positions[2],
            stack: 323,
            winner: true,
            bet: genRandomInt(0, 1000),
            positionIndicator: PositionIndicator.SMALL_BLIND,
            hand: {
                cards: [
                    { ...genRandomCard(), partOfWinningHand: true },
                    { ...genRandomCard(), partOfWinningHand: true },
                ],
            },
            avatarKey: getRandomAvatarKey(),
        },
        // {
        //     name: "Johnny Bones",
        //     position: positions[3],
        //     stack: 323,
        //     bet: genRandomInt(0, MAX_VALUES.PLAYER_STACK * 10),
        //     hand: {
        //         cards: [{ hidden: true }, { hidden: true }],
        //     },
        //     avatarKey: getRandomAvatarKey(),
        // },

        {
            positionIndicator: PositionIndicator.BUTTON,
            name: 'Marvinminwhich Lorgrikiski',
            position: positions[4],
            stack: 323,
            bet: genRandomInt(0, 100000),
            handLabel: 'Top Two',
            hand: {
                cards: [genRandomCard(), genRandomCard(), genRandomCard(), genRandomCard()],
            },
            avatarKey: getRandomAvatarKey(),
        },
        {
            name: 'Lenny',
            position: positions[5],
            stack: 323,
            hand: {
                cards: [],
            },
            avatarKey: getRandomAvatarKey(),
        },
        {
            name: 'Jimmy Dean',
            position: positions[6],
            stack: 43020,
            uuid: 'TEST_UUID_2',
            bet: genRandomInt(0, 1000000),
            positionIndicator: PositionIndicator.BIG_BLIND,
            hand: {
                cards: [{ hidden: true }, { hidden: true }],
            },
            avatarKey: getRandomAvatarKey(),
        },
        {
            name: 'Nicki Lam',
            stack: 20499,
            position: positions[7],
            sittingOut: true,
            bet: genRandomInt(0, MAX_VALUES.PLAYER_STACK),
            hand: {
                cards: [{ hidden: true }, { hidden: true }],
            },
            avatarKey: getRandomAvatarKey(),
        },
        {
            name: 'Tommy Bones',
            position: positions[8],
            stack: 323,
            folded: true,

            hand: {
                cards: [{ hidden: true }, { hidden: true }],
            },
            avatarKey: getRandomAvatarKey(),
        },
    ],
};
