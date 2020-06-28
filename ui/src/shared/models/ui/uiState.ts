import { Suit, genRandomCard } from '../game/cards';
import { ClientActionType, UiActionType } from '../api/api';
import { genRandomInt } from '../../util/util';
import { SoundByte } from '../state/audioQueue';
import { AnimationState, getCleanAnimationState } from '../state/animationState';
import { UserPreferences } from './userPreferences';

import { MAX_VALUES } from '../../util/consts';
import {
    BettingRoundActionType,
    BettingRoundAction,
    NOT_IN_HAND,
    CHECK_ACTION,
    BettingRoundStage,
} from '../game/betting';

import { GameParameters, getCleanGameParameters, getTestGameParameters } from '../game/game';
import { PlayerUUID, makeBlankUUID } from '../system/uuid';
import { getRandomAvatarKey, AvatarKeys } from './assets';
import { PlayerSummary, BettingRoundLog, PotSummary } from '../state/handLog';

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
    handLogEntries: UiHandLogEntry[];
}

export declare interface UiGameState {
    global: Global;
    controller: Controller;
    table: Table;
    players: UiPlayer[];
    menu: MenuButton[];
    gameParameters: GameParameters;
    ratHole: RatHolePlayer[];
}

export declare interface Global {
    heroIsAdmin: boolean;
    isHeroInHand: boolean;
    isGameInProgress: boolean;
    canStartGame: boolean;
    gameWillStopAfterHand: boolean;
    unqueueAllBettingRoundActions: boolean;
    areOpenSeats: boolean;
    gameParametersWillChangeAfterHand: boolean;
    computedMaxBuyin: number;
    adminNames: string[];
    isSpectator: boolean;
    isHeroAtTable: boolean;
    heroTotalChips: number;
    numberOfSpectators: number;
    willAddChips?: number;
}

export declare interface Controller {
    min: number;
    max: number;
    timeBanks: number;
    sizingButtons: SizingButton[];
    bettingActionButtons: BettingActionButtons;
    showCardButtons?: ShowCardButton[];
    dealInNextHand: boolean;
    toAct?: boolean;
    willStraddle: boolean;
    lastBettingRoundAction: BettingRoundAction;
    showWarningOnFold: boolean;
    amountToCall: number;
    playerPositionString?: string;
}

export declare interface BettingActionButtons {
    [BettingRoundActionType.FOLD]?: BettingActionButton;
    [BettingRoundActionType.CHECK]?: BettingActionButton;
    [BettingRoundActionType.CALL]?: BettingActionButton;
    [BettingRoundActionType.BET]?: BettingActionButton;
}

export declare interface BettingActionButton {
    label: string;
    action: BettingRoundActionType;
    disabled?: boolean;
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
    isBeingShown?: boolean;
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
    leaving?: boolean;
    folded?: boolean;
    toAct?: boolean;
    disconnected?: boolean;
    positionIndicator?: PositionIndicator;
    winner?: boolean;
    bet?: number;
    handLabel?: string;
    playerTimer?: PlayerTimer;
    admin: boolean;
    hand: {
        cards: UiCard[];
    };
    avatarKey: AvatarKeys;
    lastAction?: string;
}

export declare interface RatHolePlayer {
    name: string;
    stack: number;
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

export declare interface UiHandLogEntry {
    handNumber: number;
    timeHandStarted: number;
    playerSummaries: { [key: string]: PlayerSummary };
    playersSortedByPosition: PlayerUUID[];
    board: UiCard[];
    potSummaries: PotSummary[];
    bettingRounds: BettingRoundLog[];
    lastBettingRoundStage: BettingRoundStage;
}

/* Action Buttons */
export const FOLD_BUTTON: BettingActionButton = {
    action: BettingRoundActionType.FOLD,
    label: 'Fold',
};

export const CHECK_BUTTON: BettingActionButton = {
    action: BettingRoundActionType.CHECK,
    label: 'Check',
};

export const CALL_BUTTON: BettingActionButton = {
    action: BettingRoundActionType.CALL,
    label: 'Call',
};

export const BET_BUTTON: BettingActionButton = {
    action: BettingRoundActionType.BET,
    label: 'Bet',
};

export const RAISE_BUTTON: BettingActionButton = {
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

export const QUIT_GAME_BUTTON: MenuButton = {
    action: ClientActionType.QUITGAME,
    label: 'Quit Game',
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

export const BUY_CHIPS_BUTTON: MenuButton = {
    action: UiActionType.OPEN_ADD_CHIPS,
    label: 'Buy Chips',
};

export const ALL_ACTION_BUTTONS = {
    [BettingRoundActionType.FOLD]: FOLD_BUTTON,
    [BettingRoundActionType.CHECK]: CHECK_BUTTON,
    [BettingRoundActionType.BET]: BET_BUTTON,
};

export const ALL_MENU_BUTTONS = [
    START_GAME_BUTTON,
    STOP_GAME_BUTTON,
    LEAVE_TABLE_BUTTON,
    VOLUME_BUTTON,
    USER_SETTINGS_BUTTON,
    GAME_SETTINGS_BUTTON,
    BUY_CHIPS_BUTTON,
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
        bettingActionButtons: {},
        timeBanks: 0,
        showWarningOnFold: false,
        amountToCall: 0,
    };
}

export function getCleanGlobal(): Global {
    return {
        heroTotalChips: 0,
        heroIsAdmin: false,
        isGameInProgress: false,
        canStartGame: false,
        gameWillStopAfterHand: false,
        gameParametersWillChangeAfterHand: false,
        unqueueAllBettingRoundActions: true,
        areOpenSeats: true,
        computedMaxBuyin: 1,
        adminNames: [],
        isSpectator: true,
        isHeroAtTable: false,
        numberOfSpectators: 0,
        isHeroInHand: false,
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
        ratHole: [],
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
    handLogEntries: [],
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
    gameParameters: getTestGameParameters(),
    ratHole: [
        {
            name: 'Ratty Ratman',
            stack: 100,
            avatarKey: getRandomAvatarKey(),
        },
        {
            name: 'Mark Anthony',
            stack: 100,
            avatarKey: getRandomAvatarKey(),
        },
        {
            name: 'Othello',
            stack: 100,
            avatarKey: getRandomAvatarKey(),
        },
    ],
    global: {
        heroIsAdmin: true,
        isGameInProgress: true,
        canStartGame: false,
        gameWillStopAfterHand: true,
        unqueueAllBettingRoundActions: true,
        areOpenSeats: true,
        gameParametersWillChangeAfterHand: true,
        computedMaxBuyin: 1000,
        adminNames: ['Hank James Nickel', 'Rick Dolo', 'Lenny'],
        isSpectator: false,
        isHeroAtTable: true,
        heroTotalChips: 17,
        numberOfSpectators: 4,
        willAddChips: 1430,
        isHeroInHand: true,
    },
    controller: {
        showWarningOnFold: true,
        toAct: false,
        lastBettingRoundAction: CHECK_ACTION,
        min: 25,
        max: 43000,
        amountToCall: 54323,
        timeBanks: 11,
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
        bettingActionButtons: ALL_ACTION_BUTTONS,
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
                cards: [
                    { ...genRandomCard(), partOfWinningHand: true },
                    { ...genRandomCard(), partOfWinningHand: true },
                    { ...genRandomCard(), partOfWinningHand: true },
                    { ...genRandomCard(), partOfWinningHand: true },
                ],
            },
            avatarKey: getRandomAvatarKey(),
            admin: true,
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
            admin: false,
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
            admin: false,
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
        //     admin: false,
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
            admin: false,
            lastAction: 'All In',
        },
        {
            name: 'Lenny',
            position: positions[5],
            stack: 323,
            hand: {
                cards: [],
            },
            avatarKey: getRandomAvatarKey(),
            disconnected: true,
            admin: true,
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
            admin: false,
            lastAction: 'Check',
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
            admin: false,
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
            admin: false,
            lastAction: 'Fold',
        },
    ],
};
