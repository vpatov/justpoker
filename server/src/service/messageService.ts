import {
    ClientWsMessage,
    ClientActionType,
    ClientWsMessageRequest,
    BootPlayerRequest,
    Event,
    ClientAction,
    ServerAction,
    EventType,
    ServerActionType,
} from '../../../ui/src/shared/models/dataCommunication';
import { GameStateManager } from './gameStateManager';
import { ValidationService, hasError } from './validationService';
import { Service } from 'typedi';
import { GamePlayService } from './gamePlayService';
import { ValidationResponse, NO_ERROR, NOT_IMPLEMENTED_YET } from '../../../ui/src/shared/models/validation';
import { ServerStateKey, GameStage } from '../../../ui/src/shared/models/gameState';
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
    [key in EventType]: ActionProcessor;
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
        [ClientActionType.STARTGAME]: {
            validation: (uuid, req) => this.validationService.validateStartGameRequest(uuid),
            perform: (uuid, req) => this.gamePlayService.startGame(),
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.STOPGAME]: {
            validation: (uuid, req) => this.validationService.validateStopGameRequest(uuid),
            perform: (uuid, req) => this.gamePlayService.stopGame(),
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.SITDOWN]: {
            validation: (uuid, req) => this.validationService.validateSitDownRequest(uuid, req),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.sitDownPlayer(player.uuid, req.seatNumber);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.SITOUT]: {
            validation: (uuid, req) => this.validationService.validateSitOutAction(uuid),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.sitOutPlayer(player.uuid);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.SITIN]: {
            validation: (uuid, req) => this.validationService.validateSitInAction(uuid),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.sitInPlayer(player.uuid);
            },
            updates: [ServerStateKey.GAMESTATE],
        },

        [ClientActionType.STANDUP]: {
            validation: (uuid, req) => this.validationService.validateStandUpRequest(uuid),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.standUpPlayer(player.uuid);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.JOINTABLE]: {
            validation: (uuid, req) => this.validationService.validateJoinTableRequest(uuid, req),
            perform: (uuid, req) => this.gameStateManager.addNewPlayerToGame(uuid, req),
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.JOINTABLEANDSITDOWN]: {
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
        [ClientActionType.PINGSTATE]: {
            validation: (uuid, req) => NO_ERROR,
            perform: (uuid, req) => {},
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.BETACTION]: {
            validation: (uuid, req) => this.validationService.validateBettingRoundAction(uuid, req),
            perform: (uuid, req) => this.gamePlayService.performBettingRoundAction(req),
            updates: [ServerStateKey.GAMESTATE, ServerStateKey.AUDIO],
        },
        [ClientActionType.CHAT]: {
            validation: (uuid, req) => this.validationService.validateChatMessage(uuid, req),
            perform: (uuid, req) => {
                this.chatService.processChatMessage(uuid, req);
            },
            updates: [ServerStateKey.CHAT],
        },
        [ClientActionType.ADDCHIPS]: {
            validation: (_, __) => NO_ERROR,
            perform: (uuid, request) => {
                this.validationService.ensureClientIsInGame(uuid);
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.addPlayerChips(player.uuid, Number(request.chipAmount));
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.SETCHIPS]: {
            validation: (uuid, req) => this.validationService.ensureClientIsInGame(uuid),
            perform: (uuid, request) => {
                const player = this.gameStateManager.getPlayer(request.playerUUID);
                this.gameStateManager.setPlayerChips(player.uuid, Number(request.chipAmount));
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.SETPLAYERSTRADDLE]: {
            validation: (uuid, req) => this.validationService.ensureClientIsInGame(uuid),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.setWillPlayerStraddle(player.uuid, req.willStraddle);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.BOOTPLAYER]: {
            validation: (uuid, req: BootPlayerRequest) => this.validationService.validateBootPlayerAction(uuid, req),
            perform: (uuid, req: BootPlayerRequest) => this.gameStateManager.bootPlayerFromGame(req.playerUUID),
            updates: [ServerStateKey.GAMESTATE],
        },
        // TODO impement leave table
        [ClientActionType.LEAVETABLE]: {
            validation: (uuid, req) => NO_ERROR,
            perform: () => null,
            updates: [],
        },
        [ClientActionType.USETIMEBANK]: {
            validation: (uuid, req) => this.validationService.validateUseTimeBankAction(uuid),
            perform: () => this.gamePlayService.useTimeBankAction(),
            updates: [ServerStateKey.GAMESTATE],
        },
        [ServerActionType.TIMEOUT]: {
            validation: (uuid, req) => NO_ERROR,
            perform: () => {
                if (this.gameStateManager.getGameStage() === GameStage.WAITING_FOR_BET_ACTION) {
                    this.gamePlayService.timeOutPlayer();
                }
            },
            updates: [ServerStateKey.GAMESTATE],
        },
    };

    // After Event / ClientAction types have been refactored, this should be refactored
    // into three functions: processEvent, processServerAction, and processClientAction
    // processEvent would call the other two functions
    processMessage(event: Event, gameInstanceUUID: string, clientUUID: string) {
        this.gameInstanceManager.loadGameInstance(gameInstanceUUID);
        this.validationService.ensureClientExists(clientUUID);
        const actionProcessor = this.messageProcessor[event.actionType];
        const response = actionProcessor.validation(clientUUID, event.request);
        this.gameStateManager.clearUpdatedKeys();
        if (!hasError(response)) {
            logger.debug(
                `MessageService.processMessage. clientUUID: ${clientUUID}, actionType: ${
                    event.actionType
                }, messagePayload: ${JSON.stringify(event.request)}`,
            );
            actionProcessor.perform(clientUUID, event.request);
            this.gameStateManager.addUpdatedKeys(...actionProcessor.updates);
            this.stateGraphManager.processEvent(event.actionType, () => {
                /*
                    TODO
                    clientUUID is going to be refactored to be part of clientAction?
                    this anon function should be made cleaner once types are finalized
                */
                this.processMessage(
                    {
                        gameInstanceUUID,
                        actionType: ServerActionType.TIMEOUT,
                        request: {},
                    },
                    gameInstanceUUID,
                    '',
                );
            });
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
