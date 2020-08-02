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
    RemoveAdminRequest,
    AddAdminRequest,
    ChangeAvatarRequest,
} from '../../../ui/src/shared/models/api/api';
import { GameStateManager } from '../state/gameStateManager';
import { ValidationService } from '../logic/validationService';
import { Service } from 'typedi';
import { GamePlayService } from '../logic/gamePlayService';
import { ValidationResponse, NOT_IMPLEMENTED_YET } from '../../../ui/src/shared/models/api/validation';
import { GameStage } from '../../../ui/src/shared/models/game/stateGraph';
import { ServerStateKey } from '../../../ui/src/shared/models/system/server';
import { ChatService } from '../state/chatService';
import { StateGraphManager } from '../logic/stateGraphManager';
import { GameInstanceManager } from '../state/gameInstanceManager';
import { logger, debugFunc } from '../logger';
import { ConnectedClientManager } from '../server/connectedClientManager';
import { ClientUUID } from '../../../ui/src/shared/models/system/uuid';
import { AnimationService } from '../state/animationService';
import { ServerMessageType } from '../../../ui/src/shared/models/state/chat';

declare interface ActionProcessor {
    validation: (clientUUID: ClientUUID, messagePayload: ClientWsMessageRequest) => ValidationResponse;
    perform: (clientUUID: ClientUUID, messagePayload: ClientWsMessageRequest) => void;
    updates: ServerStateKey[];
}

declare type ClientActionProcessor = {
    [key in ClientActionType]: ActionProcessor;
};

// EventProcessorServicee serves as the single API entry point for mutations to the state of a game instance
// can consume actions from both the server and client
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
    ) {
        gamePlayService.setProcessEventCallback((event: Event) => this.processEvent(event));
    }

    // consume events from server and client
    // first validate event request
    // then perform action
    // lastly mark what need to be sent back to client
    clientActionProcessor: ClientActionProcessor = {
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
        [ClientActionType.SEATCHANGE]: {
            validation: (uuid, req) => this.validationService.validateSeatChangeRequest(uuid, req),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.changeSeats(player.uuid, req.seatNumber);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.JOINGAME]: {
            validation: (uuid, req) => this.validationService.validateJoinGameRequest(uuid, req),
            perform: (uuid, req) => {
                this.gameStateManager.addNewPlayerToGame(uuid, req);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.QUITGAME]: {
            validation: (uuid, req) => this.validationService.validateQuitGameRequest(uuid),
            perform: (uuid) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.removePlayerFromGame(player.uuid);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.JOINTABLE]: {
            validation: (uuid, req) => this.validationService.validateJoinTableRequest(uuid, req),
            perform: (uuid, req) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.playerJoinTable(player.uuid, req.seatNumber);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.JOINGAMEANDJOINTABLE]: {
            validation: (uuid, req) => this.validationService.validateJoinGameAndTableRequest(uuid, req),
            perform: (uuid, req) => {
                this.gameStateManager.addNewPlayerToGame(uuid, req);
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                const seatNumber = this.gameStateManager.findFirstOpenSeat();
                if (seatNumber !== -1) {
                    this.gameStateManager.playerJoinTable(player.uuid, seatNumber);
                }
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.LEAVETABLE]: {
            validation: (uuid, req) => this.validationService.validateLeaveTableRequest(uuid),
            perform: (uuid) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                this.gameStateManager.playerLeaveTable(player.uuid);
            },
            updates: [ServerStateKey.GAMESTATE],
        },

        [ClientActionType.PINGSTATE]: {
            validation: (uuid, req) => undefined,
            perform: (uuid, req) => {},
            updates: [ServerStateKey.GAMESTATE, ServerStateKey.SEND_ALL],
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
        [ClientActionType.SETCHIPS]: {
            validation: (uuid, req) => this.validationService.validateSetChipsRequest(uuid, req),
            perform: (uuid, request) => {
                const player = this.gameStateManager.getPlayer(request.playerUUID);
                this.gamePlayService.setChipsAdminAction(player.uuid, Number(request.chipAmount));
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.BUYCHIPS]: {
            validation: (uuid, req) => this.validationService.validateBuyChipsRequest(uuid, req),
            perform: (uuid, request) => {
                const player = this.gameStateManager.getPlayer(request.playerUUID);
                this.gamePlayService.buyChipsPlayerAction(player.uuid, Number(request.chipAmount));
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
        [ClientActionType.ADDADMIN]: {
            validation: (uuid, req: AddAdminRequest) => this.validationService.validateAddAdminAction(uuid, req),
            perform: (uuid, req: AddAdminRequest) => this.gameStateManager.addPlayerAdmin(req.playerUUID),
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.REMOVEADMIN]: {
            validation: (uuid, req: RemoveAdminRequest) => this.validationService.validateRemoveAdminAction(uuid, req),
            perform: (uuid, req: BootPlayerRequest) => this.gameStateManager.removePlayerAdmin(req.playerUUID),
            updates: [ServerStateKey.GAMESTATE],
        },

        [ClientActionType.USETIMEBANK]: {
            validation: (uuid, req) => this.validationService.validateUseTimeBankAction(uuid),
            perform: () => this.gamePlayService.useTimeBankAction(),
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.SHOWCARD]: {
            validation: (uuid, req) => this.validationService.validateShowHideCardAction(uuid, req.cards),
            perform: (uuid, req: ShowCardRequest) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                req.cards.forEach((card) => this.gamePlayService.setPlayerCardVisible(player.uuid, card));
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.HIDECARD]: {
            validation: (uuid, req) => this.validationService.validateShowHideCardAction(uuid, req.cards),
            perform: (uuid, req: ShowCardRequest) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);
                req.cards.forEach((card) => this.gamePlayService.setPlayerCardNotVisible(player.uuid, card));
            },
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
                    this.gamePlayService.setGameParameters(req.gameParameters);
                }
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.CHANGEAVATAR]: {
            validation: (uuid, req) => this.validationService.validateChangeAvatarRequest(uuid),
            perform: (uuid, req: ChangeAvatarRequest) => {
                const player = this.gameStateManager.getPlayerByClientUUID(uuid);

                this.gameStateManager.setPlayerAvatar(player.uuid, req.avatarKey);
            },
            updates: [ServerStateKey.GAMESTATE],
        },
        [ClientActionType.KEEPALIVE]: {
            validation: (uuid, req) => undefined,
            perform: (uuid, req: PlayerReactionRequest) => {},
            updates: [],
        },
    };

    // process actions originating from the server
    processServerAction(serverAction: ServerAction) {
        switch (serverAction.actionType) {
            case ServerActionType.GAMEPLAY_TIMEOUT: {
                if (this.gameStateManager.getGameStage() === GameStage.WAITING_FOR_BET_ACTION) {
                    this.gamePlayService.timeOutPlayer();
                }
                break;
            }
            case ServerActionType.WS_CLOSE: {
                const player = this.gameStateManager.getPlayerByClientUUID(serverAction.clientUUID);
                if (player) {
                    this.gameStateManager.setPlayerDisconnected(player.uuid);
                }

                break;
            }
            case ServerActionType.SEND_MESSAGE: {
                this.chatService.prepareServerMessage(serverAction.serverMessageType);
                this.gameStateManager.addUpdatedKeys(ServerStateKey.CHAT);
                break;
            }

            case ServerActionType.REPLENISH_TIMEBANK: {
                this.gameStateManager.replenishTimeBanks();
                this.chatService.prepareServerMessage(ServerMessageType.REPLENISH_TIMEBANK);
                this.gameStateManager.addUpdatedKeys(ServerStateKey.CHAT);
                break;
            }
        }
        this.gameStateManager.addUpdatedKeys(ServerStateKey.GAMESTATE);
    }

    // process actions originating from the client
    processClientAction(clientAction: ClientAction): ValidationResponse {
        const { clientUUID, actionType, request } = clientAction;

        let error = this.validationService.ensureClientExists(clientUUID);
        if (error) {
            logger.error(JSON.stringify(error));
            return error;
        }

        const actionProcessor = this.clientActionProcessor[actionType];
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
        logger.info(
            `EventProcessorService.processEvent. gameInstanceUUID: ${gameInstanceUUID} eventType: ${event.eventType} actionType ${actionType}`,
        );
        this.gameInstanceManager.loadGameInstance(gameInstanceUUID);

        switch (event.eventType) {
            case EventType.SERVER_ACTION: {
                this.processServerAction(event.body as ServerAction);
                break;
            }

            case EventType.CLIENT_ACTION: {
                // nothing needs to be processed or sent for keep alive
                if (event?.body?.actionType === ClientActionType.KEEPALIVE) {
                    return;
                }
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
