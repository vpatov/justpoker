import { GameParameters, GameType, BettingRoundStage, BettingRoundAction, BettingRoundActionType } from './game';
import { Player } from './player';
import { Card, Deck } from './cards';
import { ClientActionType } from './api';
import { ClientUUID, PlayerUUID, makeBlankUUID } from './uuid';

export const enum GameStage {
    NOT_IN_PROGRESS = 'NOT_IN_PROGRESS',
    INITIALIZE_NEW_HAND = 'INITIALIZE_NEW_HAND',
    SHOW_START_OF_HAND = 'SHOW_START_OF_HAND',
    SHOW_START_OF_BETTING_ROUND = 'SHOW_START_OF_BETTING_ROUND',
    WAITING_FOR_BET_ACTION = 'WAITING_FOR_BET_ACTION',
    SHOW_BET_ACTION = 'SHOW_BET_ACTION',
    FINISH_BETTING_ROUND = 'FINISH_BETTING_ROUND',
    SHOW_WINNER = 'SHOW_WINNER',
    POST_HAND_CLEANUP = 'EJECT_STACKED_PLAYERS',
    SET_CURRENT_PLAYER_TO_ACT = 'SET_PLAYER_TO_ACT',
}

// TODO consider doing something similar to messageService for queuedActionsProcessor ?
export declare interface QueuedServerAction {
    actionType: ClientActionType;
    args: any[];
}

export declare interface GameState {
    gameStage: GameStage;

    queuedServerActions: QueuedServerAction[];

    /** Sensitive field. */
    // TODO when branded types can be used as index signatures, replace string with PlayerUUID
    players: { [key: string]: Player };

    board: Array<Card>;

    gameParameters: GameParameters;

    dealerUUID: PlayerUUID;

    smallBlindUUID: PlayerUUID;

    bigBlindUUID: PlayerUUID;

    straddleUUID: PlayerUUID;

    bettingRoundStage: BettingRoundStage;

    firstToAct: PlayerUUID;

    currentPlayerToAct: PlayerUUID;

    lastBettingRoundAction: BettingRoundAction;

    timeCurrentPlayerTurnStarted: number;

    /** Amount of timebanks that the player has used this turn. */
    timeBanksUsedThisAction: number;

    pots: Array<Pot>;

    /** After pots are awarded and the hand is over, this contains set of player uuids that have won a pot. */
    handWinners: Set<PlayerUUID>;

    /**
     * This variable is checked before initializing a new hand. If it's true, and there are enough players, the
     * gameStage will proceed to INITIALIZE_NEW_HAND, the hand will be dealt, and gameplay will start. Otherwise, the
     * gameStage will proceed to NOT_IN_PROGRESS. This variable does not represent whether the game is currently
     * in progress - that is determined by the gameStage !== NOT_IN_PROGRESS, exposed in gsm.isGameInProgress().
     */
    shouldDealNextHand: boolean;

    /** Sensitive field. */
    deck: Deck;

    /** Sensitive field. */
    admin: ClientUUID;

    /** Sensitive field. */
    activeConnections: Map<ClientUUID, ConnectedClient>;

    /** Timestamp of server time when this state was processed. */
    serverTime: number;

    /** The minimum amount by which the next player can raise. */
    minRaiseDiff: number;

    /** The size of the bet of the last aggressor. It will not include callers and partial all-ins. */
    previousRaise: number;

    /** The extra amount put into the pot by an all-in that was below the min-raise. */
    partialAllInLeftOver: number;
}

export declare interface ConnectedClient {
    readonly uuid: ClientUUID;
    playerUUID: PlayerUUID;
}

export declare interface Pot {
    value: number;
    contestors: Array<PlayerUUID>;
}

export const enum ServerStateKey {
    GAMESTATE = 'GAMESTATE',
    AUDIO = 'AUDIO',
    CHAT = 'CHAT',
}

export function areServerActionsEqual(a: QueuedServerAction, b: QueuedServerAction) {
    return (
        a.actionType === b.actionType &&
        a.args.length === b.args.length &&
        a.args.every((arg, index) => arg === b.args[index])
    );
}

export const ALL_STATE_KEYS = new Set([ServerStateKey.GAMESTATE, ServerStateKey.CHAT, ServerStateKey.AUDIO]);

// TODO create partially clean game that can be used to clear state of round info.
export function getCleanGameState(): GameState {
    return {
        gameStage: GameStage.NOT_IN_PROGRESS,
        queuedServerActions: [],
        players: {},
        board: [],
        gameParameters: {
            smallBlind: 0,
            bigBlind: 0,
            gameType: GameType.NLHOLDEM,
            maxBuyin: 0,
            timeToAct: 0,
            maxPlayers: 9,
            timeBankValue: 0,
        },
        dealerUUID: makeBlankUUID(),
        smallBlindUUID: makeBlankUUID(),
        bigBlindUUID: makeBlankUUID(),
        straddleUUID: makeBlankUUID(),
        bettingRoundStage: BettingRoundStage.WAITING,
        firstToAct: makeBlankUUID(),
        admin: makeBlankUUID(),
        currentPlayerToAct: makeBlankUUID(),
        lastBettingRoundAction: { type: BettingRoundActionType.NOT_IN_HAND },
        shouldDealNextHand: false,
        activeConnections: new Map(),
        deck: {
            cards: [],
        },
        pots: [],
        handWinners: new Set<PlayerUUID>(),
        timeCurrentPlayerTurnStarted: 0,
        timeBanksUsedThisAction: 0,
        serverTime: 0,
        minRaiseDiff: 0,
        previousRaise: 0,
        partialAllInLeftOver: 0,
    };
}
