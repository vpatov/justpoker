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
    PlayerReactionRequest,
    SetGameParametersRequest,
} from '../../../ui/src/shared/models/api';
import { GameStateManager } from '../state/gameStateManager';
import { ValidationService } from '../logic/validationService';
import { Service } from 'typedi';
import { GamePlayService } from '../logic/gamePlayService';
import { ValidationResponse, NOT_IMPLEMENTED_YET } from '../../../ui/src/shared/models/validation';
import { ServerStateKey, GameStage } from '../../../ui/src/shared/models/gameState';
import { ChatService } from '../state/chatService';
import { StateGraphManager } from '../logic/stateGraphManager';
import { GameInstanceManager } from '../state/gameInstanceManager';
import { logger, debugFunc } from '../logger';
import { ConnectedClientManager } from '../server/connectedClientManager';
import { ClientUUID } from '../../../ui/src/shared/models/uuid';
import { AnimationService } from '../state/animationService';

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
        private readonly animationService: AnimationService,
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
                const error = this.validationService.validateJoinTableRequest(uuid, req);
                if (error) {
                    return error;
                }
                // TODO either remove jointableandsitdown or change code path to allow for
                // jointable validation, jointable, and then sitdown validation (because sitdown
                // validation depends on jointable being completed)
                return error;
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
            validation: (uuid, req) => undefined,
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
            validation: (_, __) => undefined,
            perform: (uuid, request) => {
                this.validationService.ensureClientIsInGame(uuid);
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.playerBuyinAddChips(player.uuid, Number(request.chipAmount));
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.SETCHIPS]: {
            validation: (uuid, req) => this.validationService.ensureClientIsInGame(uuid),
            perform: (uuid, request) => {
                const player = this.gameStateManager.getPlayer(request.playerUUID);
                this.gameStateManager.playerBuyinSetChips(player.uuid, Number(request.chipAmount));
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
            perform: (uuid, req: BootPlayerRequest) => this.gameStateManager.removePlayerFromGame(req.playerUUID),
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.LEAVETABLE]: {
            validation: (uuid, req) => this.validationService.validateLeaveTableAction(uuid),
            perform: (uuid) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.removePlayerFromGame(player.uuid);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.USETIMEBANK]: {
            validation: (uuid, req) => this.validationService.validateUseTimeBankAction(uuid),
            perform: () => this.gamePlayService.useTimeBankAction(),
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.SHOWCARD]: {
            validation: (uuid, req) => this.validationService.validateShowCardAction(uuid, req.cards),
            perform: (uuid, req: ShowCardRequest) =>
                req.cards.forEach((card) => this.gamePlayService.setPlayerCardVisible(req.playerUUID, card)),
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.REACTION]: {
            validation: (uuid, req) => this.validationService.ensureClientIsInGame(uuid),
            perform: (uuid, req: PlayerReactionRequest) =>
                this.animationService.setPlayerReaction(req.playerUUID, req.reaction),
            updates: [ServerStateKey.ANIMATION],
        },
        [ClientActionType.SETGAMEPARAMETERS]: {
            validation: (uuid, req) => this.validationService.validateSetGameParameters(uuid, req.gameParameters),
            perform: (uuid, req: SetGameParametersRequest) => {
                if (this.gameStateManager.isGameInProgress()) {
                    this.gameStateManager.queueAction({
                        actionType: ClientActionType.SETGAMEPARAMETERS,
                        args: [req.gameParameters],
                    });
                } else {
                    this.gameStateManager.setGameParameters(req.gameParameters);
                }
            },
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
    processClientAction(clientAction: ClientAction): ValidationResponse {
        const { clientUUID, actionType, request } = clientAction;

        let error = this.validationService.ensureClientExists(clientUUID);
        if (error) {
            logger.error(JSON.stringify(error));
            return error;
        }

        const actionProcessor = this.eventProcessor[actionType];
        error = actionProcessor.validation(clientUUID, request);

        if (error) {
            logger.error(JSON.stringify(error));
            return error;
        }

        this.gameStateManager.clearUpdatedKeys();
        actionProcessor.perform(clientUUID, clientAction.request);
        this.gameStateManager.addUpdatedKeys(...actionProcessor.updates);

        return undefined;
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
                // TODO refactor handling of errors from validation.
                // Consider removing NO_ERROR var and replacing with ValidationResponse | undefined
                const error = this.processClientAction(event.body as ClientAction);
                if (error) {
                    return;
                }
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