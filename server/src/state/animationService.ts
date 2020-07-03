import { Service } from 'typedi';
import {
    AnimationState,
    ReactionTrigger,
    getCleanAnimationState,
    AnimationType,
    GameplayTrigger,
} from '../../../ui/src/shared/models/state/animationState';
import { PlayerUUID } from '../../../ui/src/shared/models/system/uuid';
import { GameStateManager } from './gameStateManager';
import { ServerStateKey } from '../../../ui/src/shared/models/system/server';

@Service()
export class AnimationService {
    private animationState: AnimationState = getCleanAnimationState();
    constructor(private readonly gameStateManager: GameStateManager) {}

    loadAnimationState(animationState: AnimationState) {
        this.animationState = animationState;
    }

    getAnimationState(): AnimationState {
        return this.animationState;
    }

    setDealCardsAnimation() {
        this.gameStateManager.addUpdatedKeys(ServerStateKey.ANIMATION);
        this.animationState = {
            animationType: AnimationType.GAMEPLAY,
            trigger: GameplayTrigger.DEAL_CARDS,
        };
    }

    setPlayerReaction(playerUUID: PlayerUUID, reaction: ReactionTrigger) {
        this.animationState = {
            animationType: AnimationType.REACTION,
            trigger: reaction,
            target: playerUUID,
        };
    }

    setPlayerUseTimeBankAnimation(playerUUID: PlayerUUID) {
        this.animationState = {
            animationType: AnimationType.GAMEPLAY,
            trigger: GameplayTrigger.USE_TIME_BANK,
        };
    }

    reset() {
        this.animationState = getCleanAnimationState();
    }
}
