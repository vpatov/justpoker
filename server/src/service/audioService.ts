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

    hasSFX() {
        return this.audioQueue.global !== SoundByte.NONE;
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
    playStartOfHandSFX() {
        this.setSound(SoundByte.START_OF_HAND);
    }
<<<<<<< HEAD

=======
>>>>>>> f3d75791616de35394c568102ce6f6d45af246b3
    // playStartOfBettingRoundSFX() {
    //     this.setSound(SoundByte.START_OF_BETTING_ROUND);
    // }

    // TODO refactor personal/global and design the best way to do this

    getHeroWinSFX(): AudioQueue {
        return { global: SoundByte.HERO_WIN };
    }
    getVillainWinSFX(): AudioQueue {
        return { global: SoundByte.VILLAIN_WIN };
    }
    // getBigHeroWinSFX(): AudioQueue {
    //     return { global: SoundByte.BIG_HERO_WIN };
    // }
    getHeroTurnToActSFX(): AudioQueue {
        return { global: SoundByte.HERO_TURN_TO_ACT };
    }
}
