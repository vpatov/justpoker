import { Action, ActionType, SitDownRequest } from '../models/wsaction';
import { TableService } from './tableService';
import { Service } from "typedi";

@Service()
export class MessageService {

    constructor(private tableService: TableService) {

    }

    processMessage(action: Action) {

        const actionType = action.actionType;
        const data = action.data;

        /* things to think about:
            1) Best abstraction for message handling delegation.
                Services with DI? Inheritance?
                A switch statement like this?
            2) How you will handle validity of user actions.
            For example, if its not a users turn but their socket sends "BET"
            3) How to handle returning responses?
            4) Where is the game state going to be? Is there one game state?
                For now assume one game state
        */
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

            // if games are identified by URL, and are non-private,
            // then this isn't necessary.

            // Also, this probably shouldn't be a socket action.
            // case ActionType.JoinRoom: {
            //     return this.processJoinRoomMessage(data);
            // }

            // should room be created via http request or through websocket?

        }

    }

    processStartGameMessage(data: any) {
        return "Received start game message";
    }
    processStopGameMessage(data: any) {
        return "Received stop game message";

    }

    // how will this interact with the game?
    // will each instance of node be handling one game?
    // for now, and mvp, assume just one game.
    // can communicate via DI to tableService
    processSitDownMessage(data: SitDownRequest) {
        return "Received sitdown message";
    }
    processStandUpMessage(data: any) {
        return "Received stand up message";

    }
}
