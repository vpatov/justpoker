import { Action, ActionType, SitDownRequest } from '../models/wsaction';
import { Service, Container } from "typedi";

@Service()
export class MessageService {

    processMessage(action: Action) {

        const actionType = action.actionType;
        const data = action.data;

        /* things to think about:
            1) Best abstraction for message handling delegation. Services with DI? Inheritance?
                A switch statement like this?
            2) How you will handle validity of user actions.
            For example, if its not a users turn but their socket sends "BET"
            3) How to handle returning responses?
        */
        console.log("actionType:", actionType);
        console.log("equal?", actionType === ActionType.SitDown);
        console.log(ActionType.SitDown);
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
        }

    }

    processStartGameMessage(data: any) { }
    processStopGameMessage(data: any) { }

    // how will this interact with the game?
    // will each instance of node be handling one game?
    // for now, and mvp, assume just one game.
    // can communicate via DI to gameService
    processSitDownMessage(data: SitDownRequest) {
        return "Received sitdown message";
    }
    processStandUpMessage(data: any) {

    }

}
