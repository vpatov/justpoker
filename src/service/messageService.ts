import { Action, ActionType, SitDownRequest, JoinTableRequest } from '../models/wsaction';
import { ConnectedClient } from '../models/table';
import { TableService } from './tableService';
import { ConnectionService } from './connectionService';
import { PlayerService } from './playerService';
import { Service } from "typedi";

@Service()
export class MessageService {

    constructor(
        private tableService: TableService,
        private connectionService: ConnectionService,
        private playerService: PlayerService,
    ) { }

    processMessage(action: Action, cookie: string) {

        const actionType = action.actionType;
        const data = action.data;

        const connectedClient = this.connectionService.getConnectedClient(cookie, false);

        switch (actionType) {
            case ActionType.StartGame: {
                return this.processStartGameMessage(data);
            }
            case ActionType.StopGame: {
                return this.processStopGameMessage(data);

            }
            case ActionType.SitDown: {
                return this.processSitDownMessage(data);
            }
            case ActionType.StandUp: {
                return this.processStandUpMessage(data);
            }

            case ActionType.JoinTable: {
                return this.processJoinTableMessage(data, connectedClient);
            }

        }

    }

    processStartGameMessage(data: any) {
        return "Received start game message";
    }

    processStopGameMessage(data: any) {
        return "Received stop game message";
    }

    processSitDownMessage(data: SitDownRequest) {
        return "Received sitdown message";
    }

    processStandUpMessage(data: any) {
        return "Received stand up message";
    }

    processJoinTableMessage(data: JoinTableRequest, client: ConnectedClient) {
        const player = this.playerService.createNewPlayer(data.name, data.buyin);
        client.gamePlayer = player;
        return `Welcome to the table ${player.name}`;
    }
}
