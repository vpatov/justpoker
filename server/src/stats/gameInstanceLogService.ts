import { Service } from 'typedi';
import {
    GameInstanceLog,
    getCleanGameInstanceLog,
    HandLogEntry,
    getCleanHandLogEntry,
    PlayerSummary,
    BettingRoundLog,
    getCleanBettingRoundLog,
} from '../../../ui/src/shared/models/handLog';
import { PlayerPosition } from '../../../ui/src/shared/models/playerPosition';
import { GameInstanceUUID, PlayerUUID } from '../../../ui/src/shared/models/uuid';
import { GameStateManager } from '../state/gameStateManager';
import { Player } from '../../../ui/src/shared/models/player';
import { Card } from '../../../ui/src/shared/models/cards';
import { BettingRoundStage, BettingRoundAction } from '../../../ui/src/shared/models/game';
import { getEpochTimeMs } from '../../../ui/src/shared/util/util';
import { UiHandLogEntry } from '../../../ui/src/shared/models/uiState';

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
            playerSummary.chipDelta = chipDelta;
        }
    }

    addWinnerToCurrentHand(playerUUID: PlayerUUID, amountWon: number, handDescription?: string) {
        this.currentHandLogEntry.winners.add(playerUUID);
    }

    updatePlayerCards(playerUUID: PlayerUUID) {
        const playerSummary = this.currentHandLogEntry.playerSummaries.get(playerUUID);
        if (playerSummary) {
            playerSummary.holeCards = [...this.gameStateManager.getHoleCards(playerUUID)];
            playerSummary.wasDealtIn = playerSummary.holeCards.length > 0;
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
            chipDelta: 0,
            position: PlayerPosition.NOT_PLAYING,
        };
    }

    private sanitizeAndSerializePlayerSummaries(
        playerSummaries: Map<PlayerUUID, PlayerSummary>,
        requestorPlayerUUID: PlayerUUID,
    ) {
        const processedSummaries: { [key: string]: PlayerSummary } = {};
        playerSummaries.forEach((playerSummary, playerUUID) => {
            // Only show the hole cards if they were yours, or if they were shown
            const sanitizedHoleCards =
                requestorPlayerUUID === playerUUID
                    ? playerSummary.holeCards
                    : playerSummary.holeCards.filter((card) => card.visible);
            processedSummaries[playerUUID as string] = {
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

    /** Convert maps to simple objects for JSON serialization, and sanitize sensitive fields (like player's cards). */
    private serializeHandLogEntry(requestorPlayerUUID: PlayerUUID, handLogEntry: HandLogEntry): UiHandLogEntry {
        return {
            ...handLogEntry,
            winners: Array.from(handLogEntry.winners),
            playerSummaries: this.sanitizeAndSerializePlayerSummaries(
                handLogEntry.playerSummaries,
                requestorPlayerUUID,
            ),
            bettingRounds: Object.fromEntries(handLogEntry.bettingRounds.entries()) as {
                [key in BettingRoundStage]: BettingRoundLog;
            },
        };
    }

    getMostRecentHandLogEntry(requestorPlayerUUID: PlayerUUID) {
        return this.currentHandLogEntry
            ? this.serializeHandLogEntry(requestorPlayerUUID, this.currentHandLogEntry)
            : undefined;
    }
}
