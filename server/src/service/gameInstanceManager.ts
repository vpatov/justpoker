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

    createNewGameInstance(newGameForm: NewGameForm) {
        const gameInstanceUUID = generateUUID();
        this.gameInstances[gameInstanceUUID] = getCleanGameInstance();
        this.loadGameInstance(gameInstanceUUID);
        this.gameStateManager.initGame(newGameForm);
        return gameInstanceUUID;
    }

    doesGameExist(gameInstanceUUID: string): boolean {
        if (this.gameInstances[gameInstanceUUID]) return true;
        return false;
    }

    addClientToGameInstance(gameInstanceUUID: string, clientUUID: string) {
        this.gameStateManager.initConnectedClient(clientUUID);
    }

    getGameInstance(gameInstanceUUID: string): GameInstance | undefined {
        return this.gameInstances[gameInstanceUUID];
    }

    getActiveGameInstance(): GameInstance | undefined {
        return this.gameInstances[this.activeGameInstanceUUID];
    }

    getActiveGameInstanceUUID(): string {
        return this.activeGameInstanceUUID;
    }

    // needed due to immunability, another reason to move away from immuability
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

    loadGameInstance(gameInstanceUUID: string) {
        if (this.gameInstances[this.activeGameInstanceUUID]) {
            this.saveActiveGameInstance();
        }
        const gi = this.getGameInstance(gameInstanceUUID);
        console.log('context switching to ', gameInstanceUUID, gi);

        if (!gi) {
            // TODO error path
        }
        this.gameStateManager.loadGameState(gi.gameState);
        this.chatService.loadChatState(gi.chatLog);
        this.audioService.loadAudioState(gi.audioQueue);
        this.animationService.loadAnimationState(gi.animationState);
        this.ledgerService.loadLedger(gi.ledger);
        this.timerManager.loadStateTimer(gi.stateTimer);
        this.activeGameInstanceUUID = gameInstanceUUID;
    }
}
