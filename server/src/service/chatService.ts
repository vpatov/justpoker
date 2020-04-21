import { Service } from 'typedi';
import { ChatMessage, ChatLog } from '../../../ui/src/shared/models/chat';
import { ClientChatMessage } from '../../../ui/src/shared/models/wsaction';
import { GameStateManager } from './gameStateManager';

@Service()
export class ChatService {
    chatLog: ChatLog = {
        messages: [],
    };

    lastMessage: ChatMessage;

    constructor(private readonly gameStateManager: GameStateManager) {}

    getMessage() {
        return this.lastMessage;
    }

    processChatMessage(clientUUID: string, message: ClientChatMessage) {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        const player = this.gameStateManager.getPlayerByClientUUID(client.uuid);

        this.lastMessage = {
            timestamp: Date.now(),
            content: message.message,
            senderName: player ? player.name : 'Anonymous',
            clientUUID,
        };

        this.chatLog.messages.push(this.lastMessage);
    }
}
