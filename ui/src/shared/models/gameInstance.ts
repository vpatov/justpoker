import { GameState, getCleanGameState } from './gameState';
import { AnimationState, getCleanAnimationState } from './animationState';
import { AudioQueue, getCleanAudioQueue } from './audioQueue';
import { ChatLog, getCleanChatLog } from './chat';
import { ServerLedger, getCleanLedger } from './ledger';
import { GameInstanceLog, getCleanGameInstanceLog } from './handLog';
import { getEpochTimeMs } from '../util/util';

export declare interface GameInstance {
    gameState: GameState;
    audioQueue: AudioQueue;
    animationState: AnimationState;
    chatLog: ChatLog;
    ledger: ServerLedger;
    gameInstanceLog: GameInstanceLog;
    stateTimer: NodeJS.Timer | null;
    lastActive: number; // last epoch time game instance was accessed, used for expire
}

export function getCleanGameInstance(): GameInstance {
    return {
        gameState: getCleanGameState(),
        audioQueue: getCleanAudioQueue(),
        animationState: getCleanAnimationState(),
        chatLog: getCleanChatLog(),
        ledger: getCleanLedger(),
        gameInstanceLog: getCleanGameInstanceLog(),
        stateTimer: null,
        lastActive: getEpochTimeMs(),
    };
}
