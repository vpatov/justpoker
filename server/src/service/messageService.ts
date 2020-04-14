import {
    IncomingClientWsMessage,
    ActionType,
    SitDownRequest,
    JoinTableRequest,
} from '../../../ui/src/shared/models/wsaction';
import { CHECK_ACTION, FOLD_ACTION, BettingRoundAction, CALL_ACTION } from '../../../ui/src/shared/models/game';
import { GameStateManager } from './gameStateManager';
import { PlayerService } from './playerService';
import { ValidationService } from './validationService';
import { StateTransformService } from './stateTransformService';
import { Service } from 'typedi';
import { GameState } from '../../../ui/src/shared/models/gameState';
import { GamePlayService } from './gamePlayService';
import { Action } from 'rxjs/internal/scheduler/Action';

@Service()
export class MessageService {
    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly validationService: ValidationService,
        private readonly gamePlayService: GamePlayService,
    ) {}

    processMessage(message: IncomingClientWsMessage, clientUUID: string) {
        this.validationService.ensureClientExists(clientUUID);

        switch (message.actionType) {
            case ActionType.STARTGAME: {
                this.processStartGameMessage(clientUUID);
                break;
            }
            case ActionType.STOPGAME: {
                this.processStopGameMessage(clientUUID);
                break;
            }
            case ActionType.SITDOWN: {
                this.processSitDownMessage(clientUUID, message.sitDownRequest);
                break;
            }
            case ActionType.STANDUP: {
                this.processStandUpMessage(clientUUID);
                break;
            }
            case ActionType.JOINTABLE: {
                this.processJoinTableMessage(clientUUID, message.joinTableRequest);
                break;
            }

            case ActionType.JOINTABLEANDSITDOWN: {
                this.processJoinTableAndSitDownMessage(clientUUID, message.joinTableAndSitDownRequest);
                break;
            }

            case ActionType.CHECK: {
                this.processCheckMessage(clientUUID);
                break;
            }

            case ActionType.BET: {
                this.processBetMessage(clientUUID, message.bettingRoundAction);
                break;
            }

            case ActionType.FOLD: {
                this.processFoldMessage(clientUUID);
                break;
            }

            case ActionType.CALL: {
                this.processCallMessage(clientUUID);
                break;
            }

            // TODO formalize debug messages system
            // TODO turn off debug messages in prod obv
            case ActionType.SETCHIPSDEBUG: {
                this.gameStateManager.updatePlayer(this.gameStateManager.getPlayerByClientUUID(clientUUID).uuid, {
                    chips: Number(message.debugMessage.chipAmt),
                });
            }

            case ActionType.PINGSTATE: {
                break;
            }

            default: {
                throw Error(`Unrecognized action type: ${message.actionType}`);
            }
        }

        this.gamePlayService.startHandIfReady();
    }

    // Preconditions: at least two players are sitting down.
    processStartGameMessage(clientUUID: string): void {
        this.validationService.validateStartGameRequest(clientUUID);
        this.gamePlayService.startGame();
    }

    // Preconditions: the game is in progress.
    processStopGameMessage(clientUUID: string): void {
        this.validationService.validateStopGameRequest(clientUUID);
        this.gamePlayService.stopGame();
    }

    // TODO should sitdown, standup, jointable, chat, add chips, be put into their own service?
    // something like room service? or administrative service? how to name the aspects of gameplay
    // that are not directly related to gameplay (sitting down, buying chips, talking)
    processSitDownMessage(clientUUID: string, request: SitDownRequest): void {
        this.validationService.validateSitDownRequest(clientUUID, request);
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        this.gameStateManager.sitDownPlayer(player.uuid, request.seatNumber);
    }

    processStandUpMessage(clientUUID: string): void {
        this.validationService.validateStandUpRequest(clientUUID);
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        this.gameStateManager.standUpPlayer(player.uuid);
    }

    processJoinTableMessage(clientUUID: string, request: JoinTableRequest): void {
        this.validationService.validateJoinTableRequest(clientUUID, request);
        this.gameStateManager.addNewPlayerToGame(clientUUID, request.name, request.buyin);
    }

    // TODO you wont be able to stand up and sit back down while this is the case
    processJoinTableAndSitDownMessage(clientUUID: string, request: JoinTableRequest & SitDownRequest): void {
        this.processJoinTableMessage(clientUUID, request);
        this.processSitDownMessage(clientUUID, request);
    }

    // TODO perhaps create one actionType for a gamePlayAction, and then validate to make sure
    // that only messages from the current player to act are processed.

    processCheckMessage(clientUUID: string): void {
        this.validationService.validateCheckAction(clientUUID);
        this.gamePlayService.performBettingRoundAction(CHECK_ACTION);
    }

    processCallMessage(clientUUID: string): void {
        this.validationService.validateCallAction(clientUUID);
        this.gamePlayService.performBettingRoundAction(CALL_ACTION);
    }

    processBetMessage(clientUUID: string, action: BettingRoundAction): void {
        this.validationService.validateBetAction(clientUUID, action);
        this.gamePlayService.performBettingRoundAction(action);
    }

    processFoldMessage(clientUUID: string): void {
        this.validationService.validateFoldAction(clientUUID);
        this.gamePlayService.performBettingRoundAction(FOLD_ACTION);
    }
}
