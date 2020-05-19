import { GameState, getCleanGameState } from './gameState';
import { AnimationState, getCleanAnimationState } from './animationState';
import { AudioQueue, getCleanAudioQueue } from './audioQueue';
import { ChatLog, getCleanChatLog } from './chat';
import { ServerLedger, getCleanLedger } from './ledger';

export declare interface GameInstance {
    gameState: GameState;
    audioQueue: AudioQueue;
    animationState: AnimationState;
    chatLog: ChatLog;
    ledger: ServerLedger;
    clientUUIDs: Set<string>;
    stateTimer?: NodeJS.Timer;
}

export function getCleanGameInstance(): GameInstance {
    return {
        gameState: getCleanGameState(),
        audioQueue: getCleanAudioQueue(),
        animationState: getCleanAnimationState(),
        chatLog: getCleanChatLog(),
        ledger: getCleanLedger(),
        clientUUIDs: new Set<string>(),
    };
}
