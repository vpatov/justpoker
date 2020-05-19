import {
    ClientWsMessage,
    ActionType,
    ClientWsMessageRequest,
    BootPlayerRequest,
    NewEvent,
    ClientAction,
    ServerAction,
    GeneralAction,
} from '../../../ui/src/shared/models/dataCommunication';
import { GameStateManager } from './gameStateManager';
import { ValidationService, hasError } from './validationService';
import { Service } from 'typedi';
import { GamePlayService } from './gamePlayService';
import { ValidationResponse, NO_ERROR, NOT_IMPLEMENTED_YET } from '../../../ui/src/shared/models/validation';
import { ServerStateKey } from '../../../ui/src/shared/models/gameState';
import { ChatService } from './chatService';
import { StateGraphManager } from './stateGraphManager';
import { GameInstanceManager } from '../service/gameInstanceManager';
import { logger } from '../server/logging';

declare interface ActionProcessor {
    validation: (clientUUID: string, messagePayload: ClientWsMessageRequest) => ValidationResponse;
    perform: (clientUUID: string, messagePayload: ClientWsMessageRequest) => void;
    updates: ServerStateKey[];
}

declare type MessageProcessor = {
    [key in GeneralAction]: ActionProcessor;
};

@Service()
export class MessageService {
    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly validationService: ValidationService,
        private readonly gamePlayService: GamePlayService,
        private readonly chatService: ChatService,
        private readonly stateGraphManager: StateGraphManager,
        private readonly gameInstanceManager: GameInstanceManager,
    ) {}

    messageProcessor: MessageProcessor = {
        [ActionType.STARTGAME]: {
            validation: (uuid, req) => this.validationService.validateStartGameRequest(uuid),
            perform: (uuid, req) => this.gamePlayService.startGame(),
            updates: [ServerStateKey.GAMESTATE],
        },
        [ActionType.STOPGAME]: {
            validation: (uuid, req) => this.validationService.validateStopGameRequest(uuid),
            perform: (uuid, req) => this.gamePlayService.stopGame(),
            updates: [ServerStateKey.GAMESTATE],
        },
        [ActionType.SITDOWN]: {
            validation: (uuid, req) => this.validationService.validateSitDownRequest(uuid, req),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.sitDownPlayer(player.uuid, req.seatNumber);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ActionType.SITOUT]: {
            validation: (uuid, req) => this.validationService.validateSitOutAction(uuid),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.sitOutPlayer(player.uuid);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ActionType.SITIN]: {
            validation: (uuid, req) => this.validationService.validateSitInAction(uuid),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.sitInPlayer(player.uuid);
            },
            updates: [ServerStateKey.GAMESTATE],
        },

        [ActionType.STANDUP]: {
            validation: (uuid, req) => this.validationService.validateStandUpRequest(uuid),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.standUpPlayer(player.uuid);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ActionType.JOINTABLE]: {
            validation: (uuid, req) => this.validationService.validateJoinTableRequest(uuid, req),
            perform: (uuid, req) => this.gameStateManager.addNewPlayerToGame(uuid, req),
            updates: [ServerStateKey.GAMESTATE],
        },
        [ActionType.JOINTABLEANDSITDOWN]: {
            validation: (uuid, req) => {
                const response = this.validationService.validateJoinTableRequest(uuid, req);
                if (hasError(response)) {
                    return response;
                }
                // TODO either remove jointableandsitdown or change code path to allow for
                // jointable validation, jointable, and then sitdown validation (because sitdown
                // validation depends on jointable being completed)
                return response;
                // return this.validationService.validateSitDownRequest(uuid, req);
            },
            perform: (uuid, req) => {
                this.gameStateManager.addNewPlayerToGame(uuid, req);
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.sitDownPlayer(player.uuid, req.seatNumber);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ActionType.PINGSTATE]: {
            validation: (uuid, req) => NO_ERROR,
            perform: (uuid, req) => {},
            updates: [ServerStateKey.GAMESTATE],
        },
        [ActionType.BETACTION]: {
            validation: (uuid, req) => this.validationService.validateBettingRoundAction(uuid, req),
            perform: (uuid, req) => this.gamePlayService.performBettingRoundAction(req),
            updates: [ServerStateKey.GAMESTATE, ServerStateKey.AUDIO],
        },
        [ActionType.CHAT]: {
            validation: (uuid, req) => this.validationService.validateChatMessage(uuid, req),
            perform: (uuid, req) => {
                this.chatService.processChatMessage(uuid, req);
            },
            updates: [ServerStateKey.CHAT],
        },
        [ActionType.ADDCHIPS]: {
            validation: (_, __) => NO_ERROR,
            perform: (uuid, request) => {
                this.validationService.ensureClientIsInGame(uuid);
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.addPlayerChips(player.uuid, Number(request.chipAmount));
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ActionType.SETCHIPS]: {
            validation: (uuid, req) => this.validationService.ensureClientIsInGame(uuid),
            perform: (uuid, request) => {
                const player = this.gameStateManager.getPlayer(request.playerUUID);
                this.gameStateManager.setPlayerChips(player.uuid, Number(request.chipAmount));
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ActionType.SETPLAYERSTRADDLE]: {
            validation: (uuid, req) => this.validationService.ensureClientIsInGame(uuid),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.setWillPlayerStraddle(player.uuid, req.willStraddle);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ActionType.BOOTPLAYER]: {
            validation: (uuid, req: BootPlayerRequest) => this.validationService.validateBootPlayerAction(uuid, req),
            perform: (uuid, req: BootPlayerRequest) => this.gameStateManager.bootPlayerFromGame(req.playerUUID),
            updates: [ServerStateKey.GAMESTATE],
        },
        // TODO impement leave table
        [ActionType.LEAVETABLE]: {
            validation: (uuid, req) => NO_ERROR,
            perform: () => null,
            updates: [],
        },
        [ActionType.USETIMEBANK]: {
            validation: (uuid, req) => this.validationService.validateUseTimeBankAction(uuid),
            perform: () => this.gamePlayService.useTimeBankAction(),
            updates: [ServerStateKey.GAMESTATE],
        },
        [ServerAction.TIMEOUT]: {
            validation: (uuid, req) => NO_ERROR,
            perform: () => null,
            updates: [],
        },
    };

    processMessage(message: NewEvent, gameInstanceUUID: string, clientUUID: string) {
        this.gameInstanceManager.loadGameInstance(gameInstanceUUID);
        this.validationService.ensureClientExists(clientUUID);
        const actionProcessor = this.messageProcessor[message.actionType];
        const response = actionProcessor.validation(clientUUID, message.request);
        this.gameStateManager.clearUpdatedKeys();
        if (!hasError(response)) {
            logger.debug(
                `MessageService.processMessage. clientUUID: ${clientUUID}, actionType: ${
                    message.actionType
                }, messagePayload: ${JSON.stringify(message.request)}`,
            );
            actionProcessor.perform(clientUUID, message.request);
            this.gameStateManager.addUpdatedKeys(...actionProcessor.updates);
            this.stateGraphManager.processEvent(message.actionType);
        } else {
            // TODO process error and send error to client
            logger.error(JSON.stringify(response));
        }
    }

    // TODO should sitdown, standup, jointable, chat, add chips, be put into their own service?
    // something like room service? or administrative service? how to name the aspects of gameplay
    // that are not directly related to gameplay, and that can be done out of turn
    // i.e. (sitting down, buying chips, talking)
}
