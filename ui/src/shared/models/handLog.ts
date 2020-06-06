import { PlayerUUID, GameInstanceUUID, makeBlankUUID } from './uuid';
import { Card } from './cards';
import { BettingRoundAction, BettingRoundStage, BettingRoundActionType } from './game';

export enum PlayerPosition {
    'SB' = 'SB',
    'BB' = 'BB',
    'UTG' = 'UTG',
    'UTG+1' = 'UTG+1',
    'UTG+2' = 'UTG+2',
    'MP' = 'MP',
    'MP+1' = 'MP+1',
    'LJ' = 'LJ',
    'HJ' = 'HJ',
    'CUTOFF' = 'CUTOFF',
    'BUTTON' = 'BUTTON',
    'NOT_PLAYING' = 'NOT_PLAYING',
}

export declare interface GameInstanceLog {
    gameInstanceUUID: GameInstanceUUID;
    handLogs: HandLog[];
}

export declare interface HandLog {
    handNumber: number;
    timeHandStarted: number;
    allPlayers: Map<PlayerUUID, PlayerSummaryForHandLog>;
    board: Card[];
    winners: Set<PlayerUUID>;
    bettingRounds: Map<BettingRoundStage, BettingRoundLog>;
    lastBettingRoundStage: BettingRoundStage;
}

export declare interface BettingRoundLog {
    cardsDealtThisBettingRound: Card[];
    bettingRoundStage: BettingRoundStage;
    handActions: HandActionLog[];
}

export declare interface HandActionLog {
    playerUUID: PlayerUUID;
    bettingRoundAction: BettingRoundAction;
    timeTookToAct: number;
}

export declare interface PlayerSummaryForHandLog {
    playerUUID: PlayerUUID;
    position: PlayerPosition;
    wasDealtIn: boolean;
    holeCards: Card[];
    startingChips: number;
    chipsDelta: number;
    showedCards: boolean;
}

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
        allPlayers: new Map(),
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
        handActions: [],
    };
}

export function getCleanHandActionLog(): HandActionLog {
    return {
        playerUUID: makeBlankUUID(),
        bettingRoundAction: { type: BettingRoundActionType.NOT_IN_HAND },
        timeTookToAct: 0,
    };
}

export function getCleanPlayerSummaryForHandLog(): PlayerSummaryForHandLog {
    return {
        playerUUID: makeBlankUUID(),
        position: PlayerPosition.NOT_PLAYING,
        wasDealtIn: false,
        holeCards: [],
        startingChips: 0,
        chipsDelta: 0,
        showedCards: false,
    };
}
