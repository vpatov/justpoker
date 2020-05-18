import { Service } from 'typedi';
import { GameInstance, getCleanGameInstance } from '../../../ui/src/shared/models/gameInstance';
import { AudioService } from './audioService';
import { AnimationService } from './animationService';
import { ChatService } from './chatService';
import { GameStateManager } from './gameStateManager';

export interface GameInstances {
    [gameInstanceUUID: string]: GameInstance;
}

@Service()
export class GameInstanceManager {
    private gameInstances: GameInstances = {};
    private activeGameInstanceUUID: string = '';

    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly audioService: AudioService,
        private readonly animationService: AnimationService,
        private readonly chatService: ChatService,
    ) {}

    createNewGameInstance(gameInstanceUUID: string) {
        this.gameInstances[gameInstanceUUID] = getCleanGameInstance();
    }

    getGameInstance(gameInstanceUUID: string): GameInstance | undefined {
        return this.gameInstances[gameInstanceUUID];
    }

    getActiveGameInstance(): GameInstance | undefined {
        return this.gameInstances[this.activeGameInstanceUUID];
    }

    loadGameInstance(gameInstanceUUID: string) {
        const gi = this.getGameInstance(gameInstanceUUID);

        if (!gi) {
            // TODO error path
        }

        this.activeGameInstanceUUID = gameInstanceUUID;
        this.gameStateManager.loadGameState(gi.gameState);
        this.chatService.loadChatState(gi.chatLog);
        this.audioService.loadAudioState(gi.audioQueue);
        this.animationService.loadAnimationState(gi.animationState);
    }
}
