export declare interface AnimationState {
    animationType: AnimationType;
    trigger?: AnimationTrigger;
    target?: string;
}

export declare type AnimationTrigger = ReactionTrigger | GameplayTrigger | EmptyTrigger;

export enum AnimationType {
    EMPTY = 'EMPTY',
    REACTION = 'REACTION',
    GAMEPLAY = 'GAMEPLAY',
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

export enum GameplayTrigger {
    DEAL_CARDS = 'DEAL_CARDS',
}

export function getCleanAnimationState(): AnimationState {
    return {
        animationType: AnimationType.EMPTY,
        trigger: 'EmptyTrigger',
    };
}
