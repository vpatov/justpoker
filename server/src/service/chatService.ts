import { Service } from 'typedi';
import { ChatMessage, ChatLog } from '../../../ui/src/shared/models/chat';
import { ClientChatMessage } from '../../../ui/src/shared/models/wsaction';
import { GameStateManager } from './gameStateManager';
import { ServerStateKey } from '../../../ui/src/shared/models/gameState';

const nameCommandRegEx = /\/name\s(\w+)/;

@Service()
export class ChatService {
    // TODO put inside server state
    chatLog: ChatLog = {
        messages: [],
    };

    lastMessage: ChatMessage;

    constructor(private readonly gameStateManager: GameStateManager) {}

    getMessage() {
        return this.lastMessage;
    }

    clearMessages() {
        this.chatLog = { messages: [] };
    }

    processChatMessage(clientUUID: string, message: ClientChatMessage) {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        const player = this.gameStateManager.getPlayerByClientUUID(client.uuid);

        this.performSpecialDebugActions(clientUUID, message);

        this.lastMessage = {
            timestamp: Date.now(),
            content: message.content,
            senderName: player ? player.name : 'Anonymous',
            playerUUID: player ? player.uuid : undefined,
            clientUUID,
        };

        this.chatLog.messages.push(this.lastMessage);
    }

    performSpecialDebugActions(clientUUID: string, message: ClientChatMessage) {
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const nameMatch = message.content.match(nameCommandRegEx);
        if (nameMatch) {
            const name = nameMatch[1];
            if (player) {
                this.gameStateManager.updatePlayer(player.uuid, { name });
                this.gameStateManager.addUpdatedKeys(ServerStateKey.GAMESTATE);
            }
        }
    }
}
