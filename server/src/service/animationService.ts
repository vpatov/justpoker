import { Service } from 'typedi';
import { AnimationState, AnimationTrigger, getCleanAnimationState } from '../../../ui/src/shared/models/animationState';

@Service()
export class AnimationService {
    private animationState: AnimationState = getCleanAnimationState();

    loadAnimationState(as: AnimationState) {
        this.animationState = as;
    }

    getAnimationState(): AnimationState {
        return this.animationState;
    }
    private setTrigger(trigger: AnimationTrigger) {
        return (this.animationState.trigger = trigger);
    }
    getAnimationTrigger(): AnimationTrigger {
        return this.animationState.trigger;
    }
    reset() {
        this.animationState = getCleanAnimationState();
    }
    animateDeal() {
        this.setTrigger(AnimationTrigger.DEAL_CARDS);
    }
    animateFlipTable() {
        this.setTrigger(AnimationTrigger.FLIP_TABLE);
    }
}
