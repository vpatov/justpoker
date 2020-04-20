import { Service } from 'typedi';
import { AudioQueue, getCleanAudioQueue, SoundByte } from '../../../ui/src/shared/models/audioQueue';

@Service()
export class AudioService {
    private audioQueue: AudioQueue = getCleanAudioQueue();

    // TODO we most likely dont need "global" and "personal",
    // because it seems like there will only be one sound per client per wsmessage
    private setSound(soundByte: SoundByte) {
        return (this.audioQueue.global = soundByte);
    }

    getAudioQueue(): AudioQueue {
        return this.audioQueue;
    }

    reset() {
        this.audioQueue = getCleanAudioQueue();
    }

    playCheckSFX() {
        this.setSound(SoundByte.CHECK);
    }
    playFoldSFX() {
        this.setSound(SoundByte.FOLD);
    }
    playBetSFX() {
        this.setSound(SoundByte.BET);
    }
    playCallSFX() {
        this.setSound(SoundByte.CALL);
    }
    playHeroWinSFX() {
        this.setSound(SoundByte.HERO_WIN);
    }
    playVillianWinSFX() {
        this.setSound(SoundByte.VILLAIN_WIN);
    }
    playStartOfHandSFX() {
        this.setSound(SoundByte.START_OF_HAND);
    }
    playStartOfBettingRoundSFX() {
        this.setSound(SoundByte.START_OF_BETTING_ROUND);
    }
    // TODO
    playPersonalWinSFX() {}
}
