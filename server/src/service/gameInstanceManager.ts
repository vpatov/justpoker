import { Service } from 'typedi';
import { GameInstance, getCleanGameInstance } from '../../../ui/src/shared/models/gameInstance';
import { NewGameForm } from '../../../ui/src/shared/models/dataCommunication';
import { generateUUID } from '../../../ui/src/shared/util/util';

import { AudioService } from './audioService';
import { AnimationService } from './animationService';
import { ChatService } from './chatService';
import { GameStateManager } from './gameStateManager';
import { LedgerService } from './ledgerService';
import { TimerManager } from './timerManager';
import { UILedger } from '../../../ui/src/shared/models/ledger';
import { logger, debugFunc } from '../logger';

export interface GameInstances {
    [gameInstanceUUID: string]: GameInstance;
}

@Service()
export class GameInstanceManager {
    private gameInstances: GameInstances = {};
    private activeGameInstanceUUID = '';

    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly audioService: AudioService,
        private readonly animationService: AnimationService,
        private readonly chatService: ChatService,
        private readonly ledgerService: LedgerService,
        private readonly timerManager: TimerManager,
    ) {}

    @debugFunc()
    createNewGameInstance(newGameForm: NewGameForm) {
        const gameInstanceUUID = generateUUID();
        this.gameInstances[gameInstanceUUID] = getCleanGameInstance();
        this.loadGameInstance(gameInstanceUUID);
        this.gameStateManager.initGame(newGameForm);
        return gameInstanceUUID;
    }

    doesGameInstanceExist(gameInstanceUUID: string): boolean {
        if (this.gameInstances[gameInstanceUUID]) return true;
        return false;
    }

    // TODO decouple clients from games
    addClientToGameInstance(gameInstanceUUID: string, clientUUID: string) {
        this.gameStateManager.initConnectedClient(clientUUID);
    }

    getGameInstance(gameInstanceUUID: string): GameInstance | undefined {
        if (!this.doesGameInstanceExist(gameInstanceUUID)) {
            return undefined;
        }
        return this.gameInstances[gameInstanceUUID];
    }

    getActiveGameInstance(): GameInstance | undefined {
        return this.gameInstances[this.activeGameInstanceUUID];
    }

    getActiveGameInstanceUUID(): string {
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
    loadGameInstance(gameInstanceUUID: string) {
        if (this.gameInstances[this.activeGameInstanceUUID]) {
            this.saveActiveGameInstance();
        }
        const gi = this.getGameInstance(gameInstanceUUID);
        logger.verbose(`Switching to gameInstanceUUID: ${gameInstanceUUID}`);

        if (!gi) {
            // TODO error path
        }
        logger.info(`Switching to gameInstanceUUID: ${gameInstanceUUID}`);
        const gameInstance = gi as GameInstance;
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
    getLedgerForGameInstance(gameInstanceUUID: string): UILedger | undefined {
        if (!this.doesGameInstanceExist(gameInstanceUUID)) {
            return undefined;
        }
        const ledgerState = this.gameInstances[gameInstanceUUID].ledger;
        return this.ledgerService.convertServerLedgerToUILedger(ledgerState);
    }
}
