export declare interface AnimationState {
    animationType: AnimationType;
    trigger?: AnimationTrigger;
    target?: string;
}

export declare type AnimationTrigger = ReactionTrigger | EmptyTrigger;

export enum AnimationType {
    EMPTY = 'EMPTY',
    REACTION = 'REACTION',
}

export declare type EmptyTrigger = 'EmptyTrigger';

export enum ReactionTrigger {
    WOW = 'Wow',
    LOL = 'Lol',
    WINK = 'Wink',
    PUKE = 'Puke',
    MONEY = 'Money',
    BANANA = 'Banana',
}

export function getCleanAnimationState(): AnimationState {
    return {
        animationType: AnimationType.EMPTY,
        trigger: 'EmptyTrigger',
    };
}
