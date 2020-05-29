import { PlayerUUID, GameInstanceUUID } from "./uuid";
import { Card } from "./cards";
import { BettingRoundAction, BettingRoundStage } from "./game";

 enum PlayerPosition {
     "SB" = "SB",
     "BB" = "BB",
     "UTG" = "UTG",
     "UTG+1" = "UTG+1",
     "UTG+2" = "UTG+2",
     "MP" = "MP",
     "MP+1" = "MP+1",
     "LJ" = "LJ",
     "HJ" = "HJ",
     "CUTOFF" = "CUTOFF",
     "BUTTON" = "BUTTON",
 }

export declare interface GameInstanceLog {
    gameInstanceUUID: GameInstanceUUID;
}

export declare interface LogOfHandRecord {
    handNumber: number;
    timeHandStarted: number;
    allPlayers: PlayerUUID[];
    winner: PlayerUUID;
    actions: Map<BettingRoundStage, LogOfBettingRoundStage>;
    lastStage: BettingRoundStage;
}

export declare interface LogOfBettingRoundStage {
    cardsDealtThisStage: Card[];
    board: Card[];
    bettingRoundStage: BettingRoundStage;
    handActions: LogOfHandAction[];
}

export declare interface LogOfHandAction {
    playerUUID: PlayerUUID;
    bettingRoundAction: BettingRoundAction;
    timeTookToAct: number;
}

export declare interface LogOfPlayerSummary {
    playerUUID: PlayerUUID;
    position: PlayerPosition;
    wasDealtIn: boolean;
    holeCards: Card[];
    startingChips: number;
    chipsDelta: number;
    showedCards: boolean;
}