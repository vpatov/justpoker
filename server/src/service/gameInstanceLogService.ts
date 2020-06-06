import { Service } from 'typedi';
import {
    PlayerPosition,
    GameInstanceLog,
    getCleanGameInstanceLog,
    HandLog,
    getCleanHandLog,
    getCleanPlayerSummaryForHandLog,
    PlayerSummaryForHandLog,
    BettingRoundLog,
    getCleanBettingRoundLog,
} from '../../../ui/src/shared/models/handLog';
import { GameInstanceUUID, PlayerUUID } from '../../../ui/src/shared/models/uuid';
import { GameStateManager } from './gameStateManager';
import { Player } from '../../../ui/src/shared/models/player';
import { Card } from '../../../ui/src/shared/models/cards';
import { BettingRoundStage, BettingRoundAction } from '../../../ui/src/shared/models/game';

@Service()
export class GameInstanceLogService {
    private gameInstanceLog: GameInstanceLog;

    constructor(private readonly gameStateManager: GameStateManager) {}

    getGameInstanceLog(): GameInstanceLog {
        return this.gameInstanceLog;
    }

    getHandLogs(): HandLog[] {
        return this.gameInstanceLog.handLogs;
    }

    get currentHandLog(): HandLog {
        const handLogs = this.gameInstanceLog.handLogs;
        return handLogs[handLogs.length - 1];
    }

    get currentBettingRoundLog(): BettingRoundLog {
        return this.currentHandLog.bettingRounds.get(this.currentHandLog.lastBettingRoundStage);
    }

    get lastBettingRoundStage(): BettingRoundStage {
        return this.currentHandLog.lastBettingRoundStage;
    }

    initGameInstanceLog(gameInstanceUUID: GameInstanceUUID): void {
        this.gameInstanceLog = {
            ...getCleanGameInstanceLog(),
            gameInstanceUUID,
        };
    }

    loadGameInstanceLog(gameInstanceLog: GameInstanceLog): void {
        this.gameInstanceLog = gameInstanceLog;
    }

    initNewHand() {
        const allPlayers = new Map();
        this.gameStateManager.forEveryPlayer((player) => {
            allPlayers.set(player.uuid, this.initNewPlayerSummaryForHandLog(player));
        });
        const newHandLog = {
            ...getCleanHandLog(),
            handNumber: this.gameStateManager.getHandNumber(),
            timeHandStarted: Date.now(),
            allPlayers,
        };
        this.gameInstanceLog.handLogs.push(newHandLog);
    }

    initNewBettingRoundLog() {
        const newBettingRoundLog = {
            ...getCleanBettingRoundLog(),
            bettingRoundStage: this.lastBettingRoundStage,
        };
        this.currentHandLog.bettingRounds.set(this.lastBettingRoundStage, newBettingRoundLog);
    }

    updateLastStage() {
        this.currentHandLog.lastBettingRoundStage = this.gameStateManager.getBettingRoundStage();
    }

    updateCardsDealtThisBettingRound(cards: ReadonlyArray<Card>) {
        this.currentBettingRoundLog.cardsDealtThisBettingRound = [...cards];
    }

    updateBoard() {
        this.currentHandLog.board = this.gameStateManager.getBoard();
    }

    pushBetAction(playerUUID: PlayerUUID, bettingRoundAction: BettingRoundAction, timeTookToAct: number) {
        this.currentBettingRoundLog.handActions.push({
            playerUUID,
            bettingRoundAction,
            timeTookToAct,
        });
    }

    addWinnerToCurrentHand(playerUUID: PlayerUUID) {
        this.currentHandLog.winners.add(playerUUID);
    }

    initNewPlayerSummaryForHandLog(player: Player): PlayerSummaryForHandLog {
        return {
            playerUUID: player.uuid,
            startingChips: player.chips,
            holeCards: [...player.holeCards],
            wasDealtIn: player.holeCards.length > 0,
            chipsDelta: 0,
            position: this.gameStateManager.getPlayerPosition(player.uuid),
            showedCards: false,
        };
    }

    /*
GameInstanceLog {
    handLog {
        bettingRoundStageLog<Map>: {
            HandActionLog[]
        }
        playerSummaryForHandLog
    }
}

*/

    /*
    handNumber: number;
    timeHandStarted: number;
    allPlayers: PlayerSummaryForHandLog[];
    winner: PlayerUUID;
    bettingRounds: Map<BettingRoundStage, BettingRoundStageLog>;
    lastBettingRound: BettingRoundStage;
    */
}
