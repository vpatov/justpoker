import { AnimojiKeys } from '../ui/assets';
import { PlayerUUID } from '../system/uuid';

export declare interface AnimationState {
    animationType: AnimationType;
    trigger?: AnimationTrigger;
    target?: PlayerUUID;
}

export declare type AnimationTrigger = ReactionTrigger | GameplayTrigger | EmptyTrigger;

export enum AnimationType {
    EMPTY = 'EMPTY',
    REACTION = 'REACTION',
    GAMEPLAY = 'GAMEPLAY',
}

export declare type EmptyTrigger = 'EmptyTrigger';
export declare type ReactionTrigger = AnimojiKeys;

export enum GameplayTrigger {
    DEAL_CARDS = 'DEAL_CARDS',
}

export function getCleanAnimationState(): AnimationState {
    return {
        animationType: AnimationType.EMPTY,
        trigger: 'EmptyTrigger',
    };
}
