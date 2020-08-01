import { ClientActionType, ServerActionType } from '../api/api';

// TODO consider doing something similar to messageService for queuedActionsProcessor ?
export declare interface QueuedServerAction {
    actionType: ClientActionType | ServerActionType;
    args: any[];
}

// TODO move out of GameState
export const enum ServerStateKey {
    GAMESTATE = 'GAMESTATE',
    AUDIO = 'AUDIO',
    CHAT = 'CHAT',
    ANIMATION = 'ANIMATION',
    SEND_ALL = 'SEND_ALL',
}

export function areServerActionsEqual(a: QueuedServerAction, b: QueuedServerAction) {
    return (
        a.actionType === b.actionType &&
        a.args.length === b.args.length &&
        a.args.every((arg, index) => arg === b.args[index])
    );
}

export const ALL_STATE_KEYS = new Set([
    ServerStateKey.GAMESTATE,
    ServerStateKey.CHAT,
    ServerStateKey.AUDIO,
    ServerStateKey.SEND_ALL,
]);
