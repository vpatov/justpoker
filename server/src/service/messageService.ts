import { ClientWsMessage, ActionType, ClientWsMessageRequest } from '../../../ui/src/shared/models/wsaction';
import { GameStateManager } from './gameStateManager';
import { ValidationService, hasError } from './validationService';
import { Service } from 'typedi';
import { GamePlayService } from './gamePlayService';
import { ValidationResponse, NO_ERROR, NOT_IMPLEMENTED_YET } from '../../../ui/src/shared/models/validation';
import { ServerStateKey } from '../../../ui/src/shared/models/gameState';
import { ChatService } from './chatService';
import { BettingRoundStage } from '../../../ui/src/shared/models/game';

declare interface ActionProcessor {
    validation: (clientUUID: string, messagePayload: ClientWsMessageRequest) => ValidationResponse;
    perform: (clientUUID: string, messagePayload: ClientWsMessageRequest) => void;
    updates: ServerStateKey[];
}

declare type MessageProcessor = { [key in ActionType]: ActionProcessor };

@Service()
export class MessageService {
    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly validationService: ValidationService,
        private readonly gamePlayService: GamePlayService,
        private readonly chatService: ChatService,
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
        [ActionType.DEAL_IN_NEXT_HAND]: {
            validation: (_, __) => NO_ERROR,
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.setPlayerDealInNextHand(player.uuid);
                if (this.gameStateManager.getBettingRoundStage() === BettingRoundStage.WAITING) {
                    this.gameStateManager.setPlayersSittingOutByDealInNextHand();
                }
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ActionType.DEAL_OUT_NEXT_HAND]: {
            validation: (_, __) => NO_ERROR,
            perform: (uuid, req) => {
                console.log('hit');
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.setPlayerDealOutNextHand(player.uuid);
                if (this.gameStateManager.getBettingRoundStage() === BettingRoundStage.WAITING) {
                    this.gameStateManager.setPlayersSittingOutByDealInNextHand();
                }
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ActionType.SITIN]: {
            validation: (uuid, req) => NOT_IMPLEMENTED_YET,
            perform: (uuid, req) => {},
            updates: [],
        },
        [ActionType.SITOUT]: {
            validation: (uuid, req) => NOT_IMPLEMENTED_YET,
            perform: (uuid, req) => {},
            updates: [],
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
            validation: (_, __) => NO_ERROR,
            perform: (uuid, request) => {
                this.validationService.ensureClientIsInGame(uuid);
                const player = this.gameStateManager.getPlayer(request.playerUUID);
                this.gameStateManager.setPlayerChips(player.uuid, Number(request.chipAmount));
            },
            updates: [ServerStateKey.GAMESTATE],
        },
    };

    processMessage(message: ClientWsMessage, clientUUID: string) {
        this.validationService.ensureClientExists(clientUUID);
        const actionProcessor = this.messageProcessor[message.actionType];
        const response = actionProcessor.validation(clientUUID, message.request);
        this.gameStateManager.updatedKeys.clear();
        if (!hasError(response)) {
            console.log(
                `clientUUID: ${clientUUID}, messagePayload: ${message.request}, actionType: ${message.actionType}`,
            );
            actionProcessor.perform(clientUUID, message.request);
            this.gameStateManager.addUpdatedKeys(...actionProcessor.updates);
        } else {
            // TODO process error and send error to client
            console.log(response);
        }
        this.gamePlayService.startHandIfReady();
    }

    // TODO should sitdown, standup, jointable, chat, add chips, be put into their own service?
    // something like room service? or administrative service? how to name the aspects of gameplay
    // that are not directly related to gameplay, and that can be done out of turn
    // i.e. (sitting down, buying chips, talking)
}
