import { Service } from 'typedi';
import { GameInstance, getCleanGameInstance } from '../../../ui/src/shared/models/state/gameInstance';
import { getEpochTimeMs } from '../../../ui/src/shared/util/util';

import { AudioService } from './audioService';
import { AnimationService } from './animationService';
import { ChatService } from './chatService';
import { GameStateManager } from './gameStateManager';
import { LedgerService } from '../stats/ledgerService';
import { TimerManager } from './timerManager';
import { UILedger } from '../../../ui/src/shared/models/state/ledger';
import { logger, debugFunc } from '../logger';
import {
    GameInstanceUUID,
    makeBlankUUID,
    ClientUUID,
    generateGameInstanceUUID,
} from '../../../ui/src/shared/models/system/uuid';
import { GameInstanceLogService } from '../stats/gameInstanceLogService';
import { ConnectedClientManager } from '../server/connectedClientManager';
import { GameParameters } from '../../../ui/src/shared/models/game/game';
import { Context } from './context';

export interface GameInstances {
    [gameInstanceUUID: string]: GameInstance;
}
const EXPIRE_GAME_INSTANCE_TIME = 1000 * 60 * 60 * 2; // expire games after 2 hours of inactivity
const MAX_GEN_ID_RETRIES = 1000;

@Service()
export class GameInstanceManager {
    private gameInstances: GameInstances = {};
    private activeGameInstanceUUID: GameInstanceUUID = makeBlankUUID();
    private globalUUIDIncrement = 0;

    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly audioService: AudioService,
        private readonly animationService: AnimationService,
        private readonly chatService: ChatService,
        private readonly ledgerService: LedgerService,
        private readonly gameInstanceLogService: GameInstanceLogService,
        private readonly timerManager: TimerManager,
        private readonly connectedClientManager: ConnectedClientManager,
        private readonly context: Context,
    ) {
        setInterval(() => this.clearStaleGames(), 1000 * 60 * 60); // attempt to expire games every hour
    }

    makeGameInstanceUUID(): GameInstanceUUID {
        let gameInstanceUUID = generateGameInstanceUUID();
        let retries = 0;
        for (; retries < MAX_GEN_ID_RETRIES && !!this.gameInstances[gameInstanceUUID]; retries++) {
            gameInstanceUUID = generateGameInstanceUUID();
        }
        if (retries === MAX_GEN_ID_RETRIES) {
            gameInstanceUUID = (gameInstanceUUID + this.globalUUIDIncrement.toString()) as GameInstanceUUID;
            this.globalUUIDIncrement++;
        }
        return gameInstanceUUID;
    }

    createNewGameInstance(gameParameters: GameParameters): GameInstanceUUID {
        const gameInstanceUUID = this.makeGameInstanceUUID();
        this.gameInstances[gameInstanceUUID] = getCleanGameInstance();
        this.loadGameInstance(gameInstanceUUID);
        this.gameInstanceLogService.initGameInstanceLog(gameInstanceUUID);
        this.gameStateManager.initGame(gameParameters);
        return gameInstanceUUID;
    }

    isClientInGame(gameInstanceUUID: GameInstanceUUID, clientUUID: ClientUUID): boolean {
        const game = this.gameInstances[gameInstanceUUID];
        if (game && game.gameState.activeConnections.get(clientUUID)) {
            return true;
        }
        return false;
    }

    doesGameInstanceExist(gameInstanceUUID: GameInstanceUUID): boolean {
        if (this.gameInstances[gameInstanceUUID]) return true;
        return false;
    }

    // TODO decouple clients from games
    addClientToGameInstance(gameInstanceUUID: GameInstanceUUID, clientUUID: ClientUUID) {
        this.gameStateManager.initConnectedClient(clientUUID);
    }

    getGameInstance(gameInstanceUUID: GameInstanceUUID): GameInstance | undefined {
        return this.gameInstances[gameInstanceUUID];
    }

    getAllGameInstanceUUIDs(): GameInstanceUUID[] {
        return Object.keys(this.gameInstances).map((uuid) => uuid as GameInstanceUUID);
    }

    getActiveGameInstance(): GameInstance | undefined {
        return this.gameInstances[this.activeGameInstanceUUID];
    }

    getActiveGameInstanceUUID(): GameInstanceUUID {
        return this.activeGameInstanceUUID;
    }

    clearStaleGames() {
        logger.verbose(`attempting to expiring game instances`);
        if (this.gameInstances) {
            // TODO implement warning game will be cleared do to inactivity
            const now = getEpochTimeMs();
            Object.entries(this.gameInstances).forEach(([gameInstanceUUID, gameInstance]) => {
                const timeInactive = now - gameInstance.lastActive;
                logger.verbose(`${gameInstanceUUID} has been inactive for ${timeInactive}`);
                if (timeInactive > EXPIRE_GAME_INSTANCE_TIME) {
                    logger.verbose(`expiring game instance ${gameInstanceUUID}`);
                    this.connectedClientManager.removeGroupFromManager(gameInstanceUUID as GameInstanceUUID);
                    delete this.gameInstances[gameInstanceUUID];
                }
            });
        }
    }

    @debugFunc()
    saveActiveGameInstance() {
        const activeGameInstance: GameInstance = {
            gameState: this.gameStateManager.getGameState(),
            chatLog: this.chatService.getChatState(),
            audioQueue: this.audioService.getAudioQueue(),
            animationState: this.animationService.getAnimationState(),
            ledger: this.ledgerService.getLedger(),
            gameInstanceLog: this.gameInstanceLogService.getGameInstanceLog(),
            timerGroup: this.timerManager.getTimerGroup(),
            lastActive: getEpochTimeMs(),
        };
        this.gameInstances[this.activeGameInstanceUUID] = activeGameInstance;
    }

    @debugFunc()
    loadGameInstance(gameInstanceUUID: GameInstanceUUID) {
        // TODO is it best to save the game instance here (before loading the next one),
        // or right after finishing processing it? The latter can be done, since processing
        // has one explicit code path after our eventProcessing refactor
        if (this.gameInstances[this.activeGameInstanceUUID]) {
            this.saveActiveGameInstance();
        }
        const gameInstance = this.getGameInstance(gameInstanceUUID);
        logger.verbose(`Switching to gameInstanceUUID: ${gameInstanceUUID}`);

        if (!gameInstance) {
            // TODO error path
            logger.error(`Did not find gameInstanceUUID: ${gameInstanceUUID}`);
        }

        this.gameStateManager.loadGameState(gameInstance.gameState);
        this.chatService.loadChatState(gameInstance.chatLog);
        this.audioService.loadAudioState(gameInstance.audioQueue);
        this.animationService.loadAnimationState(gameInstance.animationState);
        this.ledgerService.loadLedger(gameInstance.ledger);
        this.timerManager.loadTimerGroup(gameInstance.timerGroup);
        this.gameInstanceLogService.loadGameInstanceLog(gameInstance.gameInstanceLog);
        this.context.load(gameInstanceUUID);
        this.activeGameInstanceUUID = gameInstanceUUID;
    }

    @debugFunc()
    resetEphemeralStates() {
        this.audioService.reset();
        this.animationService.reset();
        this.chatService.clearLastMessage();
    }

    // no need to load entire game instance as no update
    getLedgerForGameInstance(gameInstanceUUID: GameInstanceUUID): UILedger | undefined {
        const gameInstance = this.getGameInstance(gameInstanceUUID);
        if (!gameInstance) {
            return undefined;
        }
        const ledgerState = this.ledgerService.getLedger();
        return this.ledgerService.convertServerLedgerToUILedger(ledgerState);
    }

    // TODO Return UIHandLog when frontend portion is complete.
    getHandLogsForGameInstance(gameInstanceUUID: GameInstanceUUID, clientUUID: ClientUUID): Record<string, any> {
        const gameInstance = this.getGameInstance(gameInstanceUUID);
        if (!gameInstance) {
            return undefined;
        }
        this.loadGameInstance(gameInstanceUUID);
        const connectedClient = this.gameStateManager.getConnectedClient(clientUUID);
        const requestorPlayerUUID = connectedClient
            ? this.gameStateManager.getPlayerByClientUUID(clientUUID)?.uuid
            : makeBlankUUID();
        return this.gameInstanceLogService.serializeAllHandLogEntries(requestorPlayerUUID);
    }
}
