import { Service } from "typedi";
import { GameStateManager } from './gameStateManager';
import { BettingRoundActionType, BettingRoundAction } from '../models/game';
import { SitDownRequest, JoinTableRequest } from '../models/wsaction';

/*
    TODO: Redesign error message construction
    TODO: Split methods into validateAction and ensureCondition
        - validateAction methods called externall, ensureCondition methods called internally
*/

const MAX_NAME_LENGTH = 32;

@Service()
export class ValidationService {

    constructor(
        private readonly gameStateManager: GameStateManager,
    ) { }

    ensureClientExists(clientUUID: string) {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        if (!client) {
            throw Error(`Client ${clientUUID} does not exist.`);
        }
    }

    ensureClientIsInGame(clientUUID: string) {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        if (!client.playerUUID) {
            throw Error(`Client ${clientUUID} has not joined the game.`);
        }

        const player = this.gameStateManager.getPlayer(client.playerUUID);
        if (!player) {
            throw Error(`Player ${client.playerUUID} does not exist.`);
        }
    }

    ensureClientIsNotInGame(clientUUID: string) {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        if (client.playerUUID) {
            throw Error(`Client ${clientUUID} already has player association: ${client.playerUUID}`);
        }
    }

    ensurePlayerIsSitting(playerUUID: string) {
        const player = this.gameStateManager.getPlayer(playerUUID);
        if (!player.sitting) {
            throw Error(`Player is not sitting:\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`);
        }
    }

    ensurePlayerIsStanding(playerUUID: string) {
        const player = this.gameStateManager.getPlayer(playerUUID);
        if (player.sitting) {
            throw Error(`Player is not standing:\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`);
        }
    }

    // TODO can probably use string templates in a more elegant way to handle errorPrefix
    ensureCorrectPlayerToAct(clientUUID: string) {
        this.ensureClientIsInGame(clientUUID);
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        this.ensurePlayerIsSitting(player.uuid);
        const currentPlayerToAct = this.gameStateManager.getCurrentPlayerToAct();
        if (player.uuid !== currentPlayerToAct) {
            throw Error(`Not your turn!\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`);
        }
    }

    validateJoinTableRequest(clientUUID: string, request: JoinTableRequest) {
        this.ensureClientIsNotInGame(clientUUID);
        if (request.name.length > MAX_NAME_LENGTH) {
            throw Error(`Name ${request.name} is too long - exceeds limit of 32 characters.`);
        }
    }


    validateSitDownRequest(clientUUID: string, request: SitDownRequest) {
        this.ensureClientIsInGame(clientUUID);

        const seatNumber = request.seatNumber;
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const errorPrefix = `Cannot SitDown\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`;

        this.ensurePlayerIsStanding(player.uuid);

        if (player.chips <= 0) {
            throw Error(`${errorPrefix} Player needs chips to sit down.`);
        }

        if (!this.gameStateManager.isValidSeat(seatNumber)) {
            throw Error(`${errorPrefix} Seat ${seatNumber} is not a valid seat.`);
        }

        if (this.gameStateManager.isSeatTaken(seatNumber)) {
            throw Error(`${errorPrefix} Seat ${seatNumber} is taken. Please pick another`);
        }
    }

    validateStandUpRequest(clientUUID: string) {
        this.ensureClientIsInGame(clientUUID);
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        this.ensurePlayerIsSitting(player.uuid);
    }

    validateStartGameRequest(clientUUID: string) {
        // TODO validate that client is admin
        if (this.gameStateManager.isGameInProgress()) {
            throw Error(`Cannot StartGame: Game is already in progress.`);
        }
    }

    validateStopGameRequest(clientUUID: string) {
        // TODO validate that client is admin
        if (!this.gameStateManager.isGameInProgress()) {
            throw Error(`Cannot StopGame: Game is not in progress.`);
        }
    }


    validateCheckAction(clientUUID: string) {
        this.ensureCorrectPlayerToAct(clientUUID);

        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const bettingRoundActions = this.gameStateManager.getBettingRoundActions();

        for (const action of bettingRoundActions) {
            if (action.type === BettingRoundActionType.BET) {
                throw Error(`You cannot check when someone before you has bet.`);
            }
        }
    }



}