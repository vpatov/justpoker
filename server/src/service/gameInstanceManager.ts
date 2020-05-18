import { Service } from 'typedi';
import { GameInstance, getCleanGameInstance } from '../../../ui/src/shared/models/gameInstance';
import { AudioService } from './audioService';
import { AnimationService } from './animationService';
import { ChatService } from './chatService';
import { GameStateManager } from './gameStateManager';

export interface ServerGames {
    [gameInstanceUUID: string]: GameInstance;
}

@Service()
export class GameInstanceManager {
    private games: ServerGames = {};
    private activeGame: string = '';

    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly audioService: AudioService,
        private readonly animationService: AnimationService,
        private readonly chatService: ChatService,
    ) {}

    createNewGame(gameInstanceUUID: string) {
        this.games[gameInstanceUUID] = getCleanGameInstance();
    }

    getGameInstance(gameInstanceUUID: string): GameInstance | undefined {
        return this.games[gameInstanceUUID];
    }

    getActiveGameInstance(): GameInstance | undefined {
        return this.games[this.activeGame];
    }

    loadGameInstance(gameInstanceUUID: string) {
        const gi = this.getGameInstance(gameInstanceUUID);

        if (!gi) {
            // TODO error path
        }

        this.activeGame = gameInstanceUUID;
        this.gameStateManager.loadGameState(gi.gameState);
        this.chatService.loadChatState(gi.chatLog);
        this.audioService.loadAudioState(gi.audioQueue);
        this.animationService.loadAnimationState(gi.animationState);
    }
}
