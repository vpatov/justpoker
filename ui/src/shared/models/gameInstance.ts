import { GameState, getCleanGameState } from './gameState';
import { AnimationState, getCleanAnimationState } from './animationState';
import { AudioQueue, getCleanAudioQueue } from './audioQueue';
import { ChatLog, getCleanChatLog } from './chat';

export declare interface GameInstance {
    gameState: GameState;
    audioQueue: AudioQueue;
    animationState: AnimationState;
    chatLog: ChatLog;
    clients: Set<string>;
}

export function getCleanGameInstance(): GameInstance {
    return {
        gameState: getCleanGameState(),
        audioQueue: getCleanAudioQueue(),
        animationState: getCleanAnimationState(),
        chatLog: getCleanChatLog(),
        clients: new Set(),
    };
}
