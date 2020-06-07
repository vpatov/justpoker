import { PlayerUUID, GameInstanceUUID, makeBlankUUID } from './uuid';
import { Card } from './cards';
import { BettingRoundAction, BettingRoundStage, BettingRoundActionType } from './game';
import { PlayerPosition } from './playerPosition';

/** Container object for logs for a game instance. */
export declare interface GameInstanceLog {
    gameInstanceUUID: GameInstanceUUID;
    handLogs: HandLog[];
}

/** Contains a complete record of one played hand. */
export declare interface HandLog {
    handNumber: number;
    timeHandStarted: number;
    playerSummaries: Map<PlayerUUID, PlayerSummary>;
    board: Card[];
    winners: Set<PlayerUUID>;
    bettingRounds: Map<BettingRoundStage, BettingRoundLog>;
    lastBettingRoundStage: BettingRoundStage;
}

/** Contains a record of the actions completed during a betting round. */
export declare interface BettingRoundLog {
    cardsDealtThisBettingRound: Card[];
    bettingRoundStage: BettingRoundStage;
    actions: BetActionRecord[];
}

/**  */
export declare interface BetActionRecord {
    playerUUID: PlayerUUID;
    bettingRoundAction: BettingRoundAction;
    timeTookToAct: number;
}

export declare interface PlayerSummary {
    playerUUID: PlayerUUID;
    playerName: string;
    position: PlayerPosition;
    wasDealtIn: boolean;
    holeCards: Card[];
    startingChips: number;
    chipDelta: number;
}

/** Clean interface instantiators. */

export function getCleanGameInstanceLog(): GameInstanceLog {
    return {
        gameInstanceUUID: makeBlankUUID(),
        handLogs: [],
    };
}

export function getCleanHandLog(): HandLog {
    return {
        handNumber: -1,
        timeHandStarted: 0,
        playerSummaries: new Map(),
        board: [],
        winners: new Set(),
        bettingRounds: new Map(),
        lastBettingRoundStage: BettingRoundStage.WAITING,
    };
}

export function getCleanBettingRoundLog(): BettingRoundLog {
    return {
        cardsDealtThisBettingRound: [],
        bettingRoundStage: BettingRoundStage.WAITING,
        actions: [],
    };
}

export function getCleanPlayerSummary(): PlayerSummary {
    return {
        playerUUID: makeBlankUUID(),
        playerName: '',
        position: PlayerPosition.NOT_PLAYING,
        wasDealtIn: false,
        holeCards: [],
        startingChips: 0,
        chipDelta: 0,
    };
}