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

        switch (actionType) {
            case ActionType.StartGame: {
                this.processStartGameMessage(cookie);
                break;
            }
            case ActionType.StopGame: {
                this.processStopGameMessage(cookie);
                break;
            }
            case ActionType.SitDown: {
                this.processSitDownMessage(data, client);
                break;
            }
            case ActionType.StandUp: {
                this.processStandUpMessage(data);
                break;
            }
            case ActionType.JoinTable: {
                this.processJoinTableMessage(data, client);
                break;
            }

            case ActionType.PingState: {
                break;
            }
        }

        return this.gameStateManager.stripSensitiveFields(cookie);

    }

    // Preconditions: at least two players are sitting down.
    processStartGameMessage(cookie: string) {
        console.log("\n processStartGameMessage \n");
        this.gameStateManager.startGame(cookie);
    }

    // Preconditions: the game is in progress.
    processStopGameMessage(cookie: string) {
        console.log("\n processStopGameMessage \n");
    }

    processSitDownMessage(request: SitDownRequest, client: ConnectedClient) {
        console.log("\n processSitDownMessage \n");

        const seatNumber = request.seatNumber;

        if (client.playerUUID === '') {
            throw Error(`Client ${client.cookie} needs to be in ` +
                `game to sit down.`);
        }

        const player = this.gameStateManager.getPlayer(client.cookie);

        // TODO they should need at least one big blind technically
        if (player.chips <= 0) {
            throw Error(`Player ${player.name} needs chips` +
                ` to sit down.`);
        }

        if (!this.gameStateManager.isValidSeat(seatNumber)) {
            throw Error(`Seat ${seatNumber} is not a valid seat.`);
        }

        if (this.gameStateManager.isSeatTaken(seatNumber)) {
            throw Error(`Seat ${seatNumber} is taken. Please ` +
                `pick another`);
        }

        this.gameStateManager.sitDownPlayer(client.cookie, seatNumber);
    }

    // Preconditions: client is in the game and player is sitting down.
    processStandUpMessage(data: any) {
        console.log("\n processStandUpMessage \n");
    }

    // Preconditions: connectedClient.playerUUID == null
    processJoinTableMessage(data: JoinTableRequest, client: ConnectedClient) {
        console.log("\n processJoinTableMessage \n");

        // TODO consider two cases:
        // 1) client already has player association
        // 2) client does not have player association
        // Perhaps if client is not in game, they cannot have a player association
        // as a rule. For now, make that assumption.

        // TODO break out precondition validation logic into separate file
        // do this later to avoid premature overengineering
        console.log(client);
        if (client.playerUUID != '') {
            throw Error(`Client ${client.cookie} already has player association.`);
        }

        const gameState = this.gameStateManager.addNewPlayerToGame(client.cookie, data.name, data.buyin);
        console.log(`Welcome to the table ${data.name}`);
    }
}
