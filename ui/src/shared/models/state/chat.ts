import { PlayerUUID } from '../system/uuid';

/** Not sensitive */
export const MAGIC_SERVER_SEAT_NUMBER = 9452;
export const SERVER_PLAYER_UUID = 'jp-server' as PlayerUUID;

export enum ServerMessageType {
    WELCOME = 'WELCOME',
    REPLENISH_TIMEBANK = 'REPLENISH_TIMEBANK',
}

export declare interface ChatLog {
    messages: ChatMessage[];
}

export declare interface ChatMessage {
    timestamp: number;
    content: string;
    senderName: string;
    playerUUID: PlayerUUID;
    seatNumber: number;
}

export function getCleanChatLog(): ChatLog {
    return {
        messages: [],
    };
}
