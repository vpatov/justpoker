import { ClientWsMessage, ActionType, ClientWsMessageRequest } from '../../../ui/src/shared/models/wsaction';
import { GameStateManager } from './gameStateManager';
import { ValidationService, hasError } from './validationService';
import { Service } from 'typedi';
import { GamePlayService } from './gamePlayService';
import { ValidationResponse, NO_ERROR } from '../../../ui/src/shared/models/validation';

declare interface ActionProcessor {
    validation: (clientUUID: string, messagePayload: ClientWsMessageRequest) => ValidationResponse;
    perform: (clientUUID: string, messagePayload: ClientWsMessageRequest) => void;
}

declare type MessageProcessor = { [key in ActionType]: ActionProcessor };

@Service()
export class MessageService {
    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly validationService: ValidationService,
        private readonly gamePlayService: GamePlayService,
    ) {}

    messageProcessor: MessageProcessor = {
        [ActionType.STARTGAME]: {
            validation: (uuid, req) => this.validationService.validateStartGameRequest(uuid),
            perform: (uuid, req) => this.gamePlayService.startGame(),
        },
        [ActionType.STOPGAME]: {
            validation: (uuid, req) => this.validationService.validateStopGameRequest(uuid),
            perform: (uuid, req) => this.gamePlayService.stopGame(),
        },
        [ActionType.SITDOWN]: {
            validation: (uuid, req) => this.validationService.validateSitDownRequest(uuid, req),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.sitDownPlayer(player.uuid, req.seatNumber);
            },
        },
        [ActionType.STANDUP]: {
            validation: (uuid, req) => this.validationService.validateStandUpRequest(uuid),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.standUpPlayer(player.uuid);
            },
        },
        [ActionType.JOINTABLE]: {
            validation: (uuid, req) => this.validationService.validateJoinTableRequest(uuid, req),
            perform: (uuid, req) => this.gameStateManager.addNewPlayerToGame(uuid, req),
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
        },
        [ActionType.PINGSTATE]: {
            validation: (uuid, req) => NO_ERROR,
            perform: (uuid, req) => {},
        },
        [ActionType.CHECK]: {
            validation: (uuid, req) => this.validationService.validateCheckAction(uuid),
            perform: (uuid, req) => this.gamePlayService.performBettingRoundAction(req),
        },
        [ActionType.BET]: {
            validation: (uuid, req) => this.validationService.validateBetAction(uuid, req),
            perform: (uuid, req) => this.gamePlayService.performBettingRoundAction(req),
        },
        [ActionType.FOLD]: {
            validation: (uuid, req) => this.validationService.validateFoldAction(uuid),
            perform: (uuid, req) => this.gamePlayService.performBettingRoundAction(req),
        },
        [ActionType.CALL]: {
            validation: (uuid, req) => this.validationService.validateCallAction(uuid),
            perform: (uuid, req) => this.gamePlayService.performBettingRoundAction(req),
        },
        [ActionType.CHAT]: {
            validation: (uuid, req) => {
                throw Error('CHAT ws action not implemented yet.');
            },
            perform: (uuid, req) => {},
        },
        [ActionType.SETCHIPSDEBUG]: {
            validation: (_, __) => NO_ERROR,
            perform: (uuid, request) => {
                this.validationService.ensureClientIsInGame(uuid);
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.addPlayerChips(player.uuid, Number(request.chipAmount));
            },
        },
    };

    processMessage(message: ClientWsMessage, clientUUID: string) {
        this.validationService.ensureClientExists(clientUUID);
        const actionProcessor = this.messageProcessor[message.actionType];
        const response = actionProcessor.validation(clientUUID, message.request);
        if (hasError(response)) {
            // TODO process error and send error to client
            console.log(response);
        } else {
            console.log(
                `clientUUID: ${clientUUID}, messagePayload: ${message.request}, actionType: ${message.actionType}`,
            );
            actionProcessor.perform(clientUUID, message.request);
        }
        this.gamePlayService.startHandIfReady();
    }

    // TODO should sitdown, standup, jointable, chat, add chips, be put into their own service?
    // something like room service? or administrative service? how to name the aspects of gameplay
    // that are not directly related to gameplay, and that can be done out of turn
    // i.e. (sitting down, buying chips, talking)
}
