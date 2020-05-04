export declare interface AnimationState {
    trigger: AnimationTrigger;
}

export enum AnimationTrigger {
    NONE = 'NONE',
    FLIP_TABLE = 'FLIP_TABLE',
    DEAL_CARDS = 'DEAL_CARDS',
}

export function getCleanAnimationState(): AnimationState {
    return {
        trigger: AnimationTrigger.NONE,
    };
}
