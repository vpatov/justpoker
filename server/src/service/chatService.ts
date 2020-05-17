import { Service } from 'typedi';
import { ChatMessage, ChatLog } from '../../../ui/src/shared/models/chat';
import { ClientChatMessage } from '../../../ui/src/shared/models/dataCommunication';
import { GameStateManager } from './gameStateManager';
import { ServerStateKey } from '../../../ui/src/shared/models/gameState';
import { ValidationService, hasError } from './validationService';

const changeNameCommandRegEx = /\/name\s(.+)$/;
const sitDownCommandRegEx = /\/sitdown\s(\d{1,2})$/;

@Service()
export class ChatService {
    // TODO put inside server state
    chatLog: ChatLog = {
        messages: [],
    };

    lastMessage: ChatMessage | null;

    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly validationService: ValidationService,
    ) {}

    getMessage() {
        return this.lastMessage;
    }

    clearLastMessage() {
        this.lastMessage = null;
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
            seatNumber: player.seatNumber,
        };

        this.chatLog.messages.push(this.lastMessage);
    }

    performSpecialDebugActions(clientUUID: string, message: ClientChatMessage) {
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
        const sitDownMatch = message.content.match(sitDownCommandRegEx);
        if (sitDownMatch) {
            if (!player) {
                return;
            }
            const seatNumber = Number(sitDownMatch[1]);
            if (!isNaN(seatNumber)) {
                const response = this.validationService.validateSitDownRequest(clientUUID, { seatNumber });
                if (!hasError(response)) {
                    this.gameStateManager.sitDownPlayer(player.uuid, seatNumber);
                }
            }
        }
    }
}
