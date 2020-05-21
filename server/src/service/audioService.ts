import { Service } from 'typedi';
import { AudioQueue, getCleanAudioQueue, SoundByte } from '../../../ui/src/shared/models/audioQueue';
import { GameStateManager } from './gameStateManager';
import { ServerStateKey } from '../../../ui/src/shared/models/gameState';

@Service()
export class AudioService {
    private audioQueue: AudioQueue = getCleanAudioQueue();

    constructor(private readonly gameStateManager: GameStateManager) {}

    loadAudioState(as: AudioQueue) {
        this.audioQueue = as;
    }

    // TODO we most likely dont need "global" and "personal",
    // because it seems like there will only be one sound per client per wsmessage
    private setGlobalSound(soundByte: SoundByte) {
        this.gameStateManager.addUpdatedKeys(ServerStateKey.AUDIO);
        this.audioQueue.global = soundByte;
    }

    private setPersonalSound(playerUUID: string, soundByte: SoundByte) {
        this.audioQueue.personal[playerUUID] = soundByte;
    }

    getAudioQueue(): AudioQueue {
        return this.audioQueue;
    }

    reset() {
        this.audioQueue = getCleanAudioQueue();
    }

    hasSFX() {
        return this.audioQueue.global !== SoundByte.NONE;
    }

    playCheckSFX() {
        this.setGlobalSound(SoundByte.CHECK);
    }
    playFoldSFX() {
        this.setGlobalSound(SoundByte.FOLD);
    }
    playBetSFX() {
        this.setGlobalSound(SoundByte.BET);
    }
    playCallSFX() {
        this.setGlobalSound(SoundByte.CALL);
    }
    playStartOfHandSFX() {
        this.setGlobalSound(SoundByte.START_OF_HAND);
    }

    playHeroWinSFX(playerUUID: string) {
        this.setPersonalSound(playerUUID, SoundByte.HERO_WIN);
    }

    playHeroTurnToActSFX(playerUUID: string) {
        this.setPersonalSound(playerUUID, SoundByte.HERO_TO_ACT);
    }
}
