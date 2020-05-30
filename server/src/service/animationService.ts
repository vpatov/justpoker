import { Service } from 'typedi';
import {
    AnimationState,
    ReactionTrigger,
    getCleanAnimationState,
    AnimationType,
} from '../../../ui/src/shared/models/animationState';
import { PlayerUUID } from '../../../ui/src/shared/models/uuid';

@Service()
export class AnimationService {
    private animationState: AnimationState = getCleanAnimationState();

    loadAnimationState(animationState: AnimationState) {
        this.animationState = animationState;
    }

    getAnimationState(): AnimationState {
        return this.animationState;
    }

    setPlayerReaction(playerUUID: PlayerUUID, reaction: ReactionTrigger) {
        this.animationState = {
            animationType: AnimationType.REACTION,
            trigger: reaction,
            target: playerUUID,
        };
    }

    reset() {
        this.animationState = getCleanAnimationState();
    }
}
