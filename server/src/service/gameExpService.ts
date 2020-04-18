import { Service } from 'typedi';
import { GameExp, genCleanGameExp, SoundsAction } from '../../../ui/src/shared/models/gameExp';

@Service()
export class GameExpService {
    private gameExp: GameExp = genCleanGameExp();

    private setGlobalSound(as: SoundsAction) {
        return (this.gameExp.sounds.global = as);
    }

    getGameExp() {
        return this.gameExp;
    }

    resetGameExp() {
        this.gameExp = genCleanGameExp();
    }

    playCheckSFX(src?: string) {
        this.setGlobalSound(SoundsAction.CHECK);
    }
    playFoldSFX(src?: string) {
        this.setGlobalSound(SoundsAction.FOLD);
    }
    playBetSFX(src?: string) {
        this.setGlobalSound(SoundsAction.BET);
    }
    playCallSFX(src?: string) {
        this.setGlobalSound(SoundsAction.CALL);
    }
}
