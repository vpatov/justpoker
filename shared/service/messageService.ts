import {
  Action,
  ActionType,
  SitDownRequest,
  JoinTableRequest,
} from "../models/wsaction";
import { CHECK_ACTION, FOLD_ACTION } from "../models/game";
import { ConnectedClient } from "../models/table";
import { GameStateManager } from "./gameStateManager";
import { PlayerService } from "./playerService";
import { ValidationService } from "./validationService";
import { StateTransformService } from "./stateTransformService";
import { Service } from "typedi";
import { GameState } from "../models/gameState";

@Service()
export class MessageService {
  constructor(
    private readonly playerService: PlayerService,
    private readonly gameStateManager: GameStateManager,
    private readonly validationService: ValidationService,
    private readonly stateTransformService: StateTransformService
  ) {}

  processMessage(action: Action, clientUUID: string) {
    const actionType = action.actionType;
    const data = action.data;

    this.validationService.ensureClientExists(clientUUID);

    switch (actionType) {
      case ActionType.STARTGAME: {
        this.processStartGameMessage(clientUUID);
        break;
      }
      case ActionType.STOPGAME: {
        this.processStopGameMessage(clientUUID);
        break;
      }
      case ActionType.SITDOWN: {
        this.processSitDownMessage(clientUUID, data);
        break;
      }
      case ActionType.STANDUP: {
        this.processStandUpMessage(clientUUID);
        break;
      }
      case ActionType.JOINTABLE: {
        this.processJoinTableMessage(clientUUID, data);
        break;
      }

      case ActionType.CHECK: {
        this.processCheckMessage(clientUUID);
        break;
      }

      case ActionType.PINGSTATE: {
        break;
      }

      default: {
        throw Error(`Unrecognized action type: ${actionType}`);
      }
    }

    this.gameStateManager.startHandIfReady();
    return this.stateTransformService.getUIState(clientUUID);
  }

  /*
         Idea for reducing gameStateManager bloat:
         The other services could follow the same pattern as the validationService,
         and have the gameStateManager as a dependency.
         BettingActionService could
    */

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
    this.validationService.validateSitDownRequest(clientUUID, request);
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
    const gameState = this.gameStateManager.addNewPlayerToGame(
      clientUUID,
      request.name,
      request.buyin
    );
  }

  // TODO perhaps create one actionType for a gamePlayAction, and then validate to make sure
  // that only messages from the current player to act are processed.

  processCheckMessage(clientUUID: string) {
    console.log("processCheckMessage");
    this.validationService.validateCheckAction(clientUUID);
    this.gameStateManager.performBettingRoundAction(CHECK_ACTION);
  }
}
