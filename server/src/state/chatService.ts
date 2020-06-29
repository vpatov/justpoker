import { Service } from 'typedi';
import {
    ChatMessage,
    ChatLog,
    MAGIC_SERVER_SEAT_NUMBER,
    ServerMessageType,
} from '../../../ui/src/shared/models/state/chat';
import { ClientChatMessage } from '../../../ui/src/shared/models/api/api';
import { GameStateManager } from './gameStateManager';
import { ServerStateKey } from '../../../ui/src/shared/models/system/server';
import { ClientUUID } from '../../../ui/src/shared/models/system/uuid';
import { getEpochTimeMs } from '../../../ui/src/shared/util/util';

const changeNameCommandRegEx = /\/name\s(.+)$/;

const jpVersion = '0.1.0';
const welcomeMessage =
    `Welcome to JustPoker ${jpVersion}! Check out the menu in the ` +
    `top left to change the app's appearance, and to set game parameters. May the suits be with you.`;

@Service()
export class ChatService {
    chatLog: ChatLog = {
        messages: [],
    };

    lastMessage: ChatMessage | null;

    constructor(private readonly gameStateManager: GameStateManager) {}

    loadChatState(chatLog: ChatLog) {
        this.chatLog = chatLog;
    }

    getChatState(): ChatLog {
        return this.chatLog;
    }

    getMessage() {
        return this.lastMessage;
    }

    clearLastMessage() {
        this.lastMessage = null;
    }

    clearMessages() {
        this.chatLog = { messages: [] };
    }

    processChatMessage(clientUUID: ClientUUID, message: ClientChatMessage) {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        const player = this.gameStateManager.getPlayerByClientUUID(client.uuid);

        this.performSpecialDebugActions(clientUUID, message);

        this.lastMessage = {
            timestamp: getEpochTimeMs(),
            content: message.content,
            senderName: player ? player.name : 'Anonymous',
            playerUUID: player ? player.uuid : undefined,
            clientUUID,
            seatNumber: player ? player.seatNumber : -1,
        };

        this.chatLog.messages.push(this.lastMessage);
    }

    performSpecialDebugActions(clientUUID: ClientUUID, message: ClientChatMessage) {
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const nameMatch = message.content.match(changeNameCommandRegEx);
        if (nameMatch) {
            const name = nameMatch[1];
            if (player) {
                this.gameStateManager.changePlayerName(player.uuid, name);
                this.gameStateManager.addUpdatedKeys(ServerStateKey.GAMESTATE);
            }
            return;
        }
    }

    prepareServerMessage(serverMessageType: ServerMessageType) {
        const content = ((messageType: ServerMessageType) => {
            switch (messageType) {
                case ServerMessageType.WELCOME:
                    return welcomeMessage;
            }
        })(serverMessageType);

        this.lastMessage = {
            content,
            senderName: 'Server',
            seatNumber: MAGIC_SERVER_SEAT_NUMBER,
            timestamp: getEpochTimeMs(),
        } as ChatMessage;

        this.chatLog.messages.push(this.lastMessage);
    }
}
