import { Service } from 'typedi';
import { AudioQueue, getCleanAudioQueue, SoundByte } from '../../../ui/src/shared/models/audioQueue';

@Service()
export class AudioService {
    private audioQueue: AudioQueue = getCleanAudioQueue();

    private setGlobalSound(soundByte: SoundByte) {
        return (this.audioQueue.global = soundByte);
    }

    getAudioQueue(): AudioQueue {
        return this.audioQueue;
    }

    reset() {
        this.audioQueue = getCleanAudioQueue();
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
    playVictoryByFoldingSFX() {
        this.setGlobalSound(SoundByte.VICTORY_BY_FOLDING);
    }
    playStartOfHandSFX() {
        this.setGlobalSound(SoundByte.START_OF_HAND);
    }
    playStartOfBettingRoundSFX() {
        this.setGlobalSound(SoundByte.START_OF_BETTING_ROUND);
    }
    // TODO
    playPersonalWinSFX() {}
}
