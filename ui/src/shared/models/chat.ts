import { PlayerUUID, ClientUUID } from './uuid';

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
