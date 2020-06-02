import { Service } from 'typedi';
import { GameInstance, getCleanGameInstance } from '../../../ui/src/shared/models/gameInstance';
import { NewGameForm } from '../../../ui/src/shared/models/api';
import { generateUUID } from '../../../ui/src/shared/util/util';

import { AudioService } from './audioService';
import { AnimationService } from './animationService';
import { ChatService } from './chatService';
import { GameStateManager } from './gameStateManager';
import { LedgerService } from './ledgerService';
import { TimerManager } from './timerManager';
import { UILedger } from '../../../ui/src/shared/models/ledger';
import { logger, debugFunc } from '../logger';
import {
    GameInstanceUUID,
    makeBlankUUID,
    ClientUUID,
    generateGameInstanceUUID,
} from '../../../ui/src/shared/models/uuid';

export interface GameInstances {
    [gameInstanceUUID: string]: GameInstance;
}

@Service()
export class GameInstanceManager {
    private gameInstances: GameInstances = {};
    private activeGameInstanceUUID: GameInstanceUUID = makeBlankUUID();

    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly audioService: AudioService,
        private readonly animationService: AnimationService,
        private readonly chatService: ChatService,
        private readonly ledgerService: LedgerService,
        private readonly timerManager: TimerManager,
    ) {}

    @debugFunc()
    createNewGameInstance(newGameForm: NewGameForm): GameInstanceUUID {
        const gameInstanceUUID = generateGameInstanceUUID();
        this.gameInstances[gameInstanceUUID] = getCleanGameInstance();
        this.loadGameInstance(gameInstanceUUID);
        this.gameStateManager.initGame(newGameForm);
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

    getActiveGameInstance(): GameInstance | undefined {
        return this.gameInstances[this.activeGameInstanceUUID];
    }

    getActiveGameInstanceUUID(): GameInstanceUUID {
        return this.activeGameInstanceUUID;
    }

    @debugFunc()
    saveActiveGameInstance() {
        const activeGameInstance = {
            gameState: this.gameStateManager.getGameState(),
            chatLog: this.chatService.getChatState(),
            audioQueue: this.audioService.getAudioQueue(),
            animationState: this.animationService.getAnimationState(),
            ledger: this.ledgerService.getLedger(),
            stateTimer: this.timerManager.getStateTimer(),
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
        this.timerManager.loadStateTimer(gameInstance.stateTimer);
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
        const ledgerState = gameInstance.ledger;
        return this.ledgerService.convertServerLedgerToUILedger(ledgerState);
    }
}
