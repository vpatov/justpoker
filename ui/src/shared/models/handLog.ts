import { PlayerUUID, GameInstanceUUID, makeBlankUUID } from './uuid';
import { Card } from './cards';
import { BettingRoundAction, BettingRoundStage, BettingRoundActionType } from './game';
import { PlayerPosition } from './playerPosition';

/** Container object for logs for a game instance. */
export declare interface GameInstanceLog {
    gameInstanceUUID: GameInstanceUUID;
    handLogEntries: HandLogEntry[];
}

/** Contains a complete record of one played hand. */
export declare interface HandLogEntry {
    handNumber: number;
    timeHandStarted: number;
    playerSummaries: Map<PlayerUUID, PlayerSummary>;
    board: Card[];
    potSummaries: PotSummary[];
    bettingRounds: Map<BettingRoundStage, BettingRoundLog>;
    lastBettingRoundStage: BettingRoundStage;
}

export declare interface PotSummary {
    amount: number;
    playerHands: ShowdownHand[];
    winners: PotWinner[];
}

export declare interface PotWinner {
    playerUUID: PlayerUUID;
    amount: number;
}

export declare interface ShowdownHand {
    playerUUID: PlayerUUID;
    handDescription: string | undefined;
}

/** Contains a record of the actions completed during a betting round. */
export declare interface BettingRoundLog {
    cardsDealtThisBettingRound: Card[];
    bettingRoundStage: BettingRoundStage;
    actions: BetActionRecord[];
}

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
    totalChipDeltaForHand: number;
    seatNumber: number;
}

/** Clean interface instantiators. */

export function getCleanGameInstanceLog(): GameInstanceLog {
    return {
        gameInstanceUUID: makeBlankUUID(),
        handLogEntries: [],
    };
}

export function getCleanHandLogEntry(): HandLogEntry {
    return {
        handNumber: -1,
        timeHandStarted: 0,
        playerSummaries: new Map(),
        board: [],
        potSummaries: [],
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
        totalChipDeltaForHand: 0,
        seatNumber: -1,
    };
}
