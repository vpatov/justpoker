import {
    GameParameters,
    GameType,
    BettingRoundStage,
    BettingRoundAction,
} from "./game";

import { ActionType } from "./wsaction";
import { Player } from "./player";
import { Table } from "./table";
import { Card, Deck } from "./cards";

export declare interface GameState {
    /** Server queries this field to determine if it should send the state or not. */
    isStateReady: boolean;

    /** Sensitive field. */
    players: Readonly<{ [key: string]: Player }>;

    board: ReadonlyArray<Card>;

    gameParameters: Readonly<GameParameters>;

    dealerUUID: Readonly<string>;

    bettingRoundStage: Readonly<BettingRoundStage>;

    firstToAct: Readonly<string>;

    currentPlayerToAct: Readonly<string>;

    canCurrentPlayerAct: Readonly<boolean>;

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

    // smallBlindUUID: Readonly<string>;
    // bigBlindUUID: Readonly<string>;
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

export const cleanGameState: GameState = {
    isStateReady: true,
    players: {},
    board: [],
    gameParameters: {
        smallBlind: 0,
        bigBlind: 0,
        gameType: GameType.NLHOLDEM,
        timeToAct: 0,
        maxPlayers: 9,
    },
    dealerUUID: "",
    // smallBlindUUID: '',
    // bigBlindUUID: '',
    bettingRoundStage: BettingRoundStage.WAITING,
    // bettingRoundActions: [],
    firstToAct: "",
    currentPlayerToAct: "",
    canCurrentPlayerAct: false,
    shouldDealNextHand: false,
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
