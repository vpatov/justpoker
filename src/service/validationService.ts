import { Service } from "typedi";
import { GameStateManager } from './gameStateManager';
import { SitDownRequest } from '../models/wsaction';

@Service()
export class ValidationService {

    constructor(
        private readonly gameStateManager: GameStateManager,
    ) { }

    validateClientExists(clientUUID: string) {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        if (!client) {
            throw Error(`Client ${clientUUID} does not exist.`);
        }

        return client;
    }

    validateClientIsInGame(clientUUID: string) {
        const client = this.validateClientExists(clientUUID);

        if (!client.playerUUID) {
            throw Error(`Client ${clientUUID} has not joined the game.`);
        }

        const player = this.gameStateManager.getPlayer(client.playerUUID);

        if (!player) {
            throw Error(`Player ${client.playerUUID} does not exist.`);
        }

        return player;
    }

    validateClientIsNotInGame(clientUUID: string) {
        const client = this.validateClientExists(clientUUID);

        if (client.playerUUID) {
            throw Error(`Client ${clientUUID} already has player association: ${client.playerUUID}`);
        }
    }

    validateSitDownAction(clientUUID: string, request: SitDownRequest) {

        this.validateClientIsInGame(clientUUID);

        const seatNumber = request.seatNumber;
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);

        const errorPrefix = `Cannot SitDown\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`;

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

    validateStandUpAction(clientUUID: string) {
        this.validateClientIsInGame(clientUUID);

        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const errorPrefix = `Cannot StandUp\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`;

        if (!player.sitting) {
            throw Error(`${errorPrefix} Player is already standing.`)
        }
    }

    validateStartGameAction(clientUUID: string) {
        // TODO validate that client is admin
        if (this.gameStateManager.isGameInProgress()) {
            throw Error(`Cannot StartGame: Game is already in progress.`);
        }
    }

    validateStopGameAction(clientUUID: string) {
        // TODO validate that client is admin
        if (!this.gameStateManager.isGameInProgress()) {
            throw Error(`Cannot StopGame: Game is not in progress.`);
        }
    }



}
