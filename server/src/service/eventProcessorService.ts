import {
    ClientActionType,
    ClientWsMessageRequest,
    BootPlayerRequest,
    Event,
    ClientAction,
    ServerAction,
    EventType,
    ServerActionType,
    createTimeoutEvent,
    ShowCardRequest,
} from '../../../ui/src/shared/models/api';
import { GameStateManager } from './gameStateManager';
import { ValidationService, hasError } from './validationService';
import { Service } from 'typedi';
import { GamePlayService } from './gamePlayService';
import { ValidationResponse, NO_ERROR, NOT_IMPLEMENTED_YET } from '../../../ui/src/shared/models/validation';
import { ServerStateKey, GameStage } from '../../../ui/src/shared/models/gameState';
import { ChatService } from './chatService';
import { StateGraphManager } from './stateGraphManager';
import { GameInstanceManager } from './gameInstanceManager';
import { logger, debugFunc } from '../logger';
import { ConnectedClientManager } from '..//server/connectedClientManager';
import { ClientUUID } from '../../../ui/src/shared/models/uuid';

declare interface ActionProcessor {
    validation: (clientUUID: ClientUUID, messagePayload: ClientWsMessageRequest) => ValidationResponse;
    perform: (clientUUID: ClientUUID, messagePayload: ClientWsMessageRequest) => void;
    updates: ServerStateKey[];
}

declare type EventProcessor = {
    [key in ClientActionType]: ActionProcessor;
};

@Service()
export class EventProcessorService {
    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly validationService: ValidationService,
        private readonly gamePlayService: GamePlayService,
        private readonly chatService: ChatService,
        private readonly stateGraphManager: StateGraphManager,
        private readonly gameInstanceManager: GameInstanceManager,
        private readonly connectedClientManager: ConnectedClientManager,
    ) {}

    eventProcessor: EventProcessor = {
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
        [ClientActionType.SHOWCARD]: {
            validation: (uuid, req) => this.validationService.ensureClientIsInGame(uuid),
            perform: (uuid, req: ShowCardRequest) =>
                req.cards.forEach((c) => this.gameStateManager.setPlayerCardsVisible(req.playerUUID, c)),
            updates: [ServerStateKey.GAMESTATE],
        },
    };

    @debugFunc()
    processServerAction(serverAction: ServerAction) {
        switch (serverAction.actionType) {
            case ServerActionType.TIMEOUT: {
                if (this.gameStateManager.getGameStage() === GameStage.WAITING_FOR_BET_ACTION) {
                    this.gamePlayService.timeOutPlayer();
                }
                break;
            }
        }
        this.gameStateManager.addUpdatedKeys(ServerStateKey.GAMESTATE);
    }

    @debugFunc()
    processClientAction(clientAction: ClientAction) {
        const { clientUUID, actionType, request } = clientAction;

        let response = this.validationService.ensureClientExists(clientUUID);
        if (hasError(response)) {
            logger.error(JSON.stringify(response));
            return;
        }

        const actionProcessor = this.eventProcessor[actionType];
        response = actionProcessor.validation(clientUUID, request);

        if (hasError(response)) {
            logger.error(JSON.stringify(response));
            return;
        }

        this.gameStateManager.clearUpdatedKeys();
        actionProcessor.perform(clientUUID, clientAction.request);
        this.gameStateManager.addUpdatedKeys(...actionProcessor.updates);
    }

    @debugFunc()
    processEvent(event: Event) {
        const { gameInstanceUUID, actionType } = event.body;

        this.gameInstanceManager.loadGameInstance(gameInstanceUUID);
        logger.debug(
            `EventProcessorService.processEvent. gameInstanceUUID: ${gameInstanceUUID} ` +
                `eventType: ${event.eventType}`,
        );

        switch (event.eventType) {
            case EventType.SERVER_ACTION: {
                this.processServerAction(event.body as ServerAction);
                break;
            }

            case EventType.CLIENT_ACTION: {
                this.processClientAction(event.body as ClientAction);
                break;
            }
        }
        this.stateGraphManager.processStateTransitions(actionType, () => {
            this.processEvent(createTimeoutEvent(gameInstanceUUID));
        });

        this.connectedClientManager.sendStateToEachInGameInstance(gameInstanceUUID);
        this.gameInstanceManager.resetEphemeralStates();
    }
}
