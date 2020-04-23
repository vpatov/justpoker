export declare interface ChatLog {
    messages: ChatMessage[];
}

export declare interface ChatMessage {
    timestamp: number;
    content: string;
    senderName: string;
    playerUUID: string;
    clientUUID: string;
}