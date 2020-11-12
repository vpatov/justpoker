import { Service } from 'typedi';
import {
    GameInstanceLog,
    getCleanGameInstanceLog,
    HandLogEntry,
    getCleanHandLogEntry,
    PlayerSummary,
    BettingRoundLog,
    getCleanBettingRoundLog,
    PotSummary,
} from '../../../ui/src/shared/models/state/handLog';
import { PlayerPosition, getPositionIndex } from '../../../ui/src/shared/models/player/playerPosition';
import { GameInstanceUUID, PlayerUUID } from '../../../ui/src/shared/models/system/uuid';
import { GameStateManager } from '../state/gameStateManager';
import { Player } from '../../../ui/src/shared/models/player/player';
import { Card } from '../../../ui/src/shared/models/game/cards';
import {
    BettingRoundStage,
    BettingRoundAction,
    getBettingRoundStageIndex,
} from '../../../ui/src/shared/models/game/betting';
import { getEpochTimeMs } from '../../../ui/src/shared/util/util';
import { UiHandLogEntry } from '../../../ui/src/shared/models/ui/uiState';
import { logger } from '../logger';

@Service()
export class GameInstanceLogService {
    private gameInstanceLog: GameInstanceLog;

    constructor(private readonly gameStateManager: GameStateManager) {}

    private get currentHandLogEntry(): HandLogEntry {
        const handLogs = this.gameInstanceLog.handLogEntries;
        return handLogs[handLogs.length - 1];
    }

    private get currentBettingRoundLog(): BettingRoundLog {
        return this.currentHandLogEntry.bettingRounds.get(this.currentHandLogEntry.lastBettingRoundStage);
    }

    private get lastBettingRoundStage(): BettingRoundStage {
        return this.currentHandLogEntry.lastBettingRoundStage;
    }

    private get currentPotSummary(): PotSummary {
        const potSummaries = this.currentHandLogEntry.potSummaries;
        return potSummaries[potSummaries.length - 1];
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
            playerSummaries.set(player.uuid, this.initNewPlayerSummaryForHandLogEntry(player));
        });
        const newHandLogEntry: HandLogEntry = {
            ...getCleanHandLogEntry(),
            handNumber: this.gameStateManager.getHandNumber(),
            timeHandStarted: getEpochTimeMs(),
            playerSummaries,
        };
        this.gameInstanceLog.handLogEntries.push(newHandLogEntry);
    }

    initNewBettingRoundLog() {
        const newBettingRoundLog = {
            ...getCleanBettingRoundLog(),
            bettingRoundStage: this.lastBettingRoundStage,
        };
        this.currentHandLogEntry.bettingRounds.set(this.lastBettingRoundStage, newBettingRoundLog);
    }

    updateLastBettingRoundStage() {
        this.currentHandLogEntry.lastBettingRoundStage = this.gameStateManager.getBettingRoundStage();
    }

    updateCardsDealtThisBettingRound(cards: ReadonlyArray<Card>) {
        this.currentBettingRoundLog.cardsDealtThisBettingRound = [...cards];
        this.updateBoard();
    }

    private updateBoard() {
        this.currentHandLogEntry.board = [...this.gameStateManager.getBoard()];
    }

    pushBetAction(playerUUID: PlayerUUID, bettingRoundAction: BettingRoundAction, timeTookToAct: number) {
        this.currentBettingRoundLog.actions.push({
            playerUUID,
            bettingRoundAction,
            timeTookToAct,
        });
    }

    updatePlayerChipDelta(playerUUID: PlayerUUID, chipDelta: number) {
        const playerSummary = this.currentHandLogEntry.playerSummaries.get(playerUUID);
        if (playerSummary) {
            playerSummary.totalChipDeltaForHand = chipDelta;
        }
    }

    initializePotSummary(amount: number) {
        this.currentHandLogEntry.potSummaries.push({
            amount,
            winners: [],
            playerHands: [],
        });
    }

    addPlayerHandToPotSummary(playerUUID: PlayerUUID, handDescription: string | undefined) {
        this.currentPotSummary.playerHands.push({
            playerUUID,
            handDescription,
        });
    }

    addWinnerToPotSummary(playerUUID: PlayerUUID, amount: number) {
        this.currentPotSummary.winners.push({
            playerUUID,
            amount,
        });
    }

    updatePlayerCards(playerUUID: PlayerUUID) {
        const playerSummary = this.currentHandLogEntry.playerSummaries.get(playerUUID);
        if (playerSummary) {
            playerSummary.holeCards = [...this.gameStateManager.getHoleCards(playerUUID)];
            playerSummary.wasDealtIn = true;
        } else {
            logger.error(
                `undefined playerSummary for ${playerUUID}.` +
                    `players: ${JSON.stringify(this.gameStateManager.getPlayers())}`,
            );
        }
    }

    updatePlayerPositions() {
        const positionMap = this.gameStateManager.getPlayerPositionMap();
        this.currentHandLogEntry.playerSummaries.forEach((playerSummary, playerUUID) => {
            playerSummary.position = positionMap.get(playerUUID);
        });
    }

    private initNewPlayerSummaryForHandLogEntry(player: Readonly<Player>): PlayerSummary {
        return {
            playerUUID: player.uuid,
            playerName: player.name,
            startingChips: player.chips,
            holeCards: [...player.holeCards],
            wasDealtIn: player.holeCards.length > 0,
            totalChipDeltaForHand: 0,
            position: PlayerPosition.NOT_PLAYING,
            seatNumber: player.seatNumber,
        };
    }

    private sanitizePlayerSummaries(playerSummaries: Map<PlayerUUID, PlayerSummary>, requestorPlayerUUID: PlayerUUID) {
        const processedSummaries: { [key: string]: PlayerSummary } = {};
        playerSummaries.forEach((playerSummary, playerUUID) => {
            // Only show the hole cards if they were yours, or if they were shown
            const sanitizedHoleCards =
                requestorPlayerUUID === playerUUID
                    ? playerSummary.holeCards
                    : playerSummary.holeCards.filter((card) => card.visible);
            processedSummaries[playerUUID] = {
                ...playerSummary,
                holeCards: sanitizedHoleCards,
            };
        });
        return processedSummaries;
    }

    serializeAllHandLogEntries(requestorPlayerUUID: PlayerUUID): UiHandLogEntry[] {
        const handLogs = this.gameInstanceLog.handLogEntries.map((handLogEntry) =>
            this.serializeHandLogEntry(requestorPlayerUUID, handLogEntry),
        );
        return handLogs;
    }

    private serializeBettingRounds(bettingRounds: Map<BettingRoundStage, BettingRoundLog>) {
        const processedBettingRounds: BettingRoundLog[] = [];
        bettingRounds.forEach((bettingRoundLog, bettingRoundStage) => {
            processedBettingRounds.push({
                ...bettingRoundLog,
            });
        });

        processedBettingRounds.sort(
            (a, b) => getBettingRoundStageIndex(a.bettingRoundStage) - getBettingRoundStageIndex(b.bettingRoundStage),
        );
        return processedBettingRounds;
    }

    private areAllHoleCardsVisible(playerUUID: PlayerUUID) {
        this.updatePlayerCards(playerUUID);
        const playerSummary = this.currentHandLogEntry.playerSummaries.get(playerUUID);
        if (!playerSummary) {
            // TODO reproduce this bug and fix
            logger.error(
                `areAllHoleCardsVisible got undefined player for ${playerUUID}.\n` +
                    `Current hand log entry: ${JSON.stringify(this.currentHandLogEntry)}.\n` +
                    `Current players in gsm: ${JSON.stringify(this.gameStateManager.getPlayers())}`,
            );
            return false;
        }
        return playerSummary.holeCards.every((card) => card.visible);
    }

    private sanitizePotSummaries(potSummaries: PotSummary[]): PotSummary[] {
        return potSummaries.map((potSummary) => ({
            amount: potSummary.amount,
            winners: potSummary.winners,
            playerHands: potSummary.playerHands.map((playerHand) => ({
                playerUUID: playerHand.playerUUID,
                handDescription: this.areAllHoleCardsVisible(playerHand.playerUUID)
                    ? playerHand.handDescription
                    : undefined,
            })),
        }));
    }

    private serializePlayersSortedByPosition(playerSummaries: Map<PlayerUUID, PlayerSummary>) {
        const dealtInPlayers: PlayerUUID[] = [];
        playerSummaries.forEach((playerSummary, playerUUID) => {
            dealtInPlayers.push(playerUUID);
        });
        const headCount = dealtInPlayers.length;
        return dealtInPlayers.sort(
            (a, b) =>
                getPositionIndex(playerSummaries.get(a).position, headCount) -
                getPositionIndex(playerSummaries.get(b).position, headCount),
        );
    }

    /** Convert maps to simple objects for JSON serialization, and sanitize sensitive fields (like player's cards). */
    private serializeHandLogEntry(requestorPlayerUUID: PlayerUUID, handLogEntry: HandLogEntry): UiHandLogEntry {
        return {
            ...handLogEntry,
            potSummaries: this.sanitizePotSummaries(handLogEntry.potSummaries),
            playerSummaries: this.sanitizePlayerSummaries(handLogEntry.playerSummaries, requestorPlayerUUID),
            bettingRounds: this.serializeBettingRounds(handLogEntry.bettingRounds),
            playersSortedByPosition: this.serializePlayersSortedByPosition(handLogEntry.playerSummaries),
        };
    }

    getMostRecentHandLogEntry(requestorPlayerUUID: PlayerUUID) {
        return this.currentHandLogEntry
            ? this.serializeHandLogEntry(requestorPlayerUUID, this.currentHandLogEntry)
            : undefined;
    }
}
