import {
    GameParameters,
    GameType,
    BettingRoundStage,
} from "./game";

import { Player } from "./player";
import { Table } from "./table";
import { Card, Deck } from "./cards";

export const enum GameStage {
    NOT_IN_PROGRESS = "NOT_IN_PROGRESS",
    INITIALIZE_NEW_HAND = "INITIALIZE_NEW_HAND",
    SHOW_START_OF_HAND = "SHOW_START_OF_HAND",
    SHOW_START_OF_BETTING_ROUND = "SHOW_START_OF_BETTING_ROUND",
    WAITING_FOR_BET_ACTION = "WAITING_FOR_BET_ACTION",
    SHOW_BET_ACTION = "SHOW_BET_ACTION",
    FINISH_BETTING_ROUND = "FINISH_BETTING_ROUND",
    SHOW_WINNER = "SHOW_WINNER",
    EJECT_STACKED_PLAYERS = "EJECT_STACKED_PLAYERS",
}

export declare interface GameState {
    gameStage: GameStage;

    /** Sensitive field. */
    players: Readonly<{ [key: string]: Player }>;

    board: ReadonlyArray<Card>;

    gameParameters: Readonly<GameParameters>;

    dealerUUID: Readonly<string>;

    smallBlindUUID: Readonly<string>;

    bigBlindUUID: Readonly<string>;

    bettingRoundStage: Readonly<BettingRoundStage>;

    firstToAct: Readonly<string>;

    currentPlayerToAct: Readonly<string>;

    timeCurrentPlayerTurnStarted: number;

    pots: ReadonlyArray<Pot>;

    shouldDealNextHand: Readonly<boolean>;

    /** Sensitive field. */
    deck: Readonly<Deck>;

    /** Sensitive field. */
    table: Readonly<Table>;

    serverTime: Readonly<number>;

    /** The minimum amount by which the next player can raise. */
    minRaiseDiff: Readonly<number>;

    /** The size of the bet of the last aggressor. It will not include callers and partial all-ins. */
    previousRaise: number;

    /** The extra amount put into the pot by an all-in that was below the min-raise. */
    partialAllInLeftOver: number;

    unsetQueuedAction: boolean;


    // bettingRoundActions: ReadonlyArray<BettingRoundAction>
}

export declare interface Pot {
    value: number;
    contestors: ReadonlyArray<string>;
}

export const enum ServerStateKey {
    GAMESTATE = "GAMESTATE",
    AUDIO = "AUDIO",
    CHAT = "CHAT",
}

export const ALL_STATE_KEYS = new Set([ServerStateKey.GAMESTATE, ServerStateKey.CHAT, ServerStateKey.AUDIO]);

export const cleanGameState: GameState = {
    gameStage: GameStage.NOT_IN_PROGRESS,
    players: {},
    board: [],
    gameParameters: {
        smallBlind: 0,
        bigBlind: 0,
        gameType: GameType.NLHOLDEM,
        maxBuyin: 0,
        timeToAct: 0,
        maxPlayers: 9,
    },
    dealerUUID: "",
    smallBlindUUID: '',
    bigBlindUUID: '',
    bettingRoundStage: BettingRoundStage.WAITING,
    // bettingRoundActions: [],
    firstToAct: "",
    currentPlayerToAct: "",
    shouldDealNextHand: false,
    unsetQueuedAction: false,
    deck: {
        cards: [],
    },
    pots: [],
    table: {
        uuid: "",
        activeConnections: new Map(),
        password: "",
    },
    timeCurrentPlayerTurnStarted: 0,
    serverTime: 0,
    minRaiseDiff: 0,
    previousRaise: 0,
    partialAllInLeftOver: 0,
};
