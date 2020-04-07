import { Action, ActionType, SitDownRequest, JoinTableRequest } from '../models/wsaction';
import { CHECK_ACTION, FOLD_ACTION } from '../models/game';
import { ConnectedClient } from '../models/table';
import { GameStateManager } from './gameStateManager';
import { PlayerService } from './playerService';
import { ValidationService } from './validationService';
import { Service } from "typedi";
import { GameState } from '../models/gameState';



@Service()
export class MessageService {

    constructor(
        private readonly playerService: PlayerService,
        private readonly gameStateManager: GameStateManager,
        private readonly validationService: ValidationService,
    ) { }


    processGameStateForUI(gameState: GameState) {

        // need to define translation!!

        const UIState = {
            missionControl: {
                heroStack: 0,
                pot: 0,
            },
            table: {
                spots: 9,
                pot: 0,
                communityCards: [] as any[],
                players: [] as any[],

            },
        }

        return UIState

    }

    getGameStateMessageForUI() {

        const gs = this.gameStateManager.getGameState()
        const gsUI = this.processGameStateForUI(gs)

        return { game: gsUI }
    }

    processMessage(action: Action, clientUUID: string) {

        const actionType = action.actionType;
        const data = action.data;

        this.validationService.ensureClientExists(clientUUID);

        switch (actionType) {
            case ActionType.StartGame: {
                this.processStartGameMessage(clientUUID);
                break;
            }
            case ActionType.StopGame: {
                this.processStopGameMessage(clientUUID);
                break;
            }
            case ActionType.SitDown: {
                this.processSitDownMessage(clientUUID, data);
                break;
            }
            case ActionType.StandUp: {
                this.processStandUpMessage(clientUUID);
                break;
            }
            case ActionType.JoinTable: {
                this.processJoinTableMessage(clientUUID, data);
                break;
            }

            case ActionType.Check: {
                this.processCheckMessage(clientUUID);
            }

            case ActionType.PingState: {
                break;
            }
        }

        this.gameStateManager.pollForGameContinuation();
        return this.gameStateManager.stripSensitiveFields(clientUUID);

    }

    // Preconditions: at least two players are sitting down.
    processStartGameMessage(clientUUID: string) {
        this.validationService.validateStartGameRequest(clientUUID);
        this.gameStateManager.startGame();
    }

    // Preconditions: the game is in progress.
    processStopGameMessage(clientUUID: string) {
        this.validationService.validateStopGameRequest(clientUUID);
        this.gameStateManager.stopGame();
    }

    processSitDownMessage(clientUUID: string, request: SitDownRequest) {
        this.validationService.validateSitDownRequest(clientUUID, request)
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        this.gameStateManager.sitDownPlayer(player.uuid, request.seatNumber);
    }

    processStandUpMessage(clientUUID: string) {
        this.validationService.validateStandUpRequest(clientUUID);
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        this.gameStateManager.standUpPlayer(player.uuid);
    }

    processJoinTableMessage(clientUUID: string, request: JoinTableRequest) {
        this.validationService.validateJoinTableRequest(clientUUID, request);
        const gameState = this.gameStateManager.addNewPlayerToGame(clientUUID, request.name, request.buyin);
    }

    // TODO perhaps create one actionType for a gamePlayAction, and then validate to make sure
    // that only messages from the current player to act are processed.

    processCheckMessage(clientUUID: string) {
        this.validationService.validateCheckAction(clientUUID);
        this.gameStateManager.performBettingRoundAction(CHECK_ACTION);
    }
}
