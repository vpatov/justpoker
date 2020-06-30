import { PlayerUUID, ClientUUID } from '../system/uuid';

export const MAGIC_SERVER_SEAT_NUMBER = 9452;

export enum ServerMessageType {
    WELCOME = 'WELCOME',
}

export declare interface ChatLog {
    messages: ChatMessage[];
}

export declare interface ChatMessage {
    timestamp: number;
    content: string;
    senderName: string;
    playerUUID: PlayerUUID;
    clientUUID: ClientUUID;
    seatNumber: number;
}

export function getCleanChatLog(): ChatLog {
    return {
        messages: [],
    };
}
