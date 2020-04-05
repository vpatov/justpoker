import { Action, ActionType, SitDownRequest, JoinTableRequest } from '../models/wsaction';
import { ConnectedClient } from '../models/table';
import { GameStateManager } from './gameStateManager';
import { PlayerService } from './playerService';
import { Service } from "typedi";

@Service()
export class MessageService {

    constructor(
        private readonly playerService: PlayerService,
        private readonly gameStateManager: GameStateManager,
    ) { }

    processMessage(action: Action, cookie: string) {

        const actionType = action.actionType;
        const data = action.data;

        const client = this.gameStateManager.getConnectedClient(cookie);

        // TODO validate the action
        // for example, a connectedClient that is not in
        // the game cannot sit down/stand up. Non-admin cannot
        // start/stop game, etc.
        // This validations layer should be checking to make
        // sure that actions that shouldn't be available to the user in the
        // UI are not being performed.

        switch (actionType) {
            case ActionType.StartGame: {
                return this.processStartGameMessage(data);
            }
            case ActionType.StopGame: {
                return this.processStopGameMessage(data);
            }
            case ActionType.SitDown: {
                return this.processSitDownMessage(data, client);
            }
            case ActionType.StandUp: {
                return this.processStandUpMessage(data);
            }
            case ActionType.JoinTable: {
                return this.processJoinTableMessage(data, client);
            }
        }

    }

    // Preconditions: at least two players are sitting down.
    processStartGameMessage(data: any) {
        return "Received start game message";
    }

    // Preconditions: the game is in progress.
    processStopGameMessage(data: any) {
        return "Received stop game message";
    }

    // Preconditions:
    // client has player
    // player has chips
    // seat is valid seat
    // seat isn't taken
    processSitDownMessage(request: SitDownRequest, client: ConnectedClient) {

        const seatNumber = request.seatNumber;

        /*
        if (client.gamePlayer == null) {
            throw Error(`Client ${client.cookie} needs to be in ` +
                `game to sit down.`);
        }
        // TODO they should need at least one big blind technically
        if (client.gamePlayer.chips <= 0) {
            throw Error(`Player ${client.gamePlayer.name} needs chips` +
                ` to sit down.`);
        }

        if (!this.gameStateManager.isValidSeat(seatNumber)) {
            throw Error(`Seat ${seatNumber} is not a valid seat.`);
        }

        if (this.gameStateManager.isSeatTaken(seatNumber)) {
            throw Error(`Seat ${seatNumber} is taken. Please ` +
                `pick another`);
        }
        */

        this.gameStateManager.sitDownPlayer(client, seatNumber);
        return "Received sitdown message";
    }

    // Preconditions: client is in the game and player is sitting down.
    processStandUpMessage(data: any) {
        return "Received stand up message";
    }

    // Preconditions: connectedClient.gamePlayer == null
    processJoinTableMessage(data: JoinTableRequest, client: ConnectedClient) {
        // TODO consider two cases:
        // 1) client already has player association
        // 2) client does not have player association
        // Perhaps if client is not in game, they cannot have a player association
        // as a rule. For now, make that assumption.

        // TODO break out precondition validation logic into separate file
        // do this later to avoid premature overengineering
        if (client.gamePlayer != '') {
            throw Error(`Client ${client.cookie} already has player association.`);
        }

        const gameState = this.gameStateManager.addNewPlayerToGame(client, data.name, data.buyin);
        console.log(`Welcome to the table ${data.name}`);

        return gameState;

    }
}
