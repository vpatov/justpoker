import { Service } from 'typedi';
import {
    PlayerPosition,
    GameInstanceLog,
    getCleanGameInstanceLog,
    HandLog,
    getCleanHandLog,
    PlayerSummary,
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

    private get currentHandLog(): HandLog {
        const handLogs = this.gameInstanceLog.handLogs;
        return handLogs[handLogs.length - 1];
    }

    private get currentBettingRoundLog(): BettingRoundLog {
        return this.currentHandLog.bettingRounds.get(this.currentHandLog.lastBettingRoundStage);
    }

    private get lastBettingRoundStage(): BettingRoundStage {
        return this.currentHandLog.lastBettingRoundStage;
    }

    getGameInstanceLog(): GameInstanceLog {
        return this.gameInstanceLog;
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
        const playerSummaries = new Map();
        this.gameStateManager.forEveryPlayer((player) => {
            playerSummaries.set(player.uuid, this.initNewPlayerSummaryForHandLog(player));
        });
        const newHandLog: HandLog = {
            ...getCleanHandLog(),
            handNumber: this.gameStateManager.getHandNumber(),
            timeHandStarted: Date.now(),
            playerSummaries,
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

    updateLastBettingRoundStage() {
        this.currentHandLog.lastBettingRoundStage = this.gameStateManager.getBettingRoundStage();
    }

    updateCardsDealtThisBettingRound(cards: ReadonlyArray<Card>) {
        this.currentBettingRoundLog.cardsDealtThisBettingRound = [...cards];
        this.updateBoard();
    }

    private updateBoard() {
        this.currentHandLog.board = [...this.gameStateManager.getBoard()];
    }

    pushBetAction(playerUUID: PlayerUUID, bettingRoundAction: BettingRoundAction, timeTookToAct: number) {
        this.currentBettingRoundLog.actions.push({
            playerUUID,
            bettingRoundAction,
            timeTookToAct,
        });
    }

    updatePlayerChipDelta(playerUUID: PlayerUUID, chipDelta: number) {
        this.currentHandLog.playerSummaries.get(playerUUID).chipDelta = chipDelta;
    }

    addWinnerToCurrentHand(playerUUID: PlayerUUID) {
        this.currentHandLog.winners.add(playerUUID);
    }

    updatePlayerCards(playerUUID: PlayerUUID) {
        const player = this.currentHandLog.playerSummaries.get(playerUUID);
        player.holeCards = [...this.gameStateManager.getHoleCards(playerUUID)];
        player.wasDealtIn = player.holeCards.length > 0;
        player.position = this.gameStateManager.getPlayerPosition(player.playerUUID);
    }

    private initNewPlayerSummaryForHandLog(player: Readonly<Player>): PlayerSummary {
        return {
            playerUUID: player.uuid,
            playerName: player.name,
            startingChips: player.chips,
            holeCards: [...player.holeCards],
            wasDealtIn: player.holeCards.length > 0,
            chipDelta: 0,
            position: PlayerPosition.NOT_PLAYING,
            showedCards: false,
        };
    }

    private sanitizeAndSerializePlayerSummaries(
        playerSummaries: Map<PlayerUUID, PlayerSummary>,
        requestorPlayerUUID: PlayerUUID,
    ) {
        const processedSummaries: { [key: string]: PlayerSummary } = {};
        playerSummaries.forEach((playerSummary, playerUUID) => {
            processedSummaries[playerUUID as string] = {
                ...playerSummary,
                holeCards: playerUUID === requestorPlayerUUID ? playerSummary.holeCards : [],
            };
        });
        return processedSummaries;
    }

    serializeHandLogs(requestorPlayerUUID: PlayerUUID) {
        const handLogs = this.gameInstanceLog.handLogs.map((handLog) => ({
            ...handLog,
            winners: Array.from(handLog.winners),
            playerSummaries: this.sanitizeAndSerializePlayerSummaries(handLog.playerSummaries, requestorPlayerUUID),
            bettingRounds: Object.fromEntries(handLog.bettingRounds.entries()),
        }));
        return handLogs;
    }
}
