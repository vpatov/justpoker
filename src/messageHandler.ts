import { Action, ActionType, SitDownRequest } from './models/wsaction';

class MessageHandler {



    processMessage(actionType: ActionType, data: any) {

        /* things to think about:
            1) Best abstraction for message handling delegation. Services with DI? Inheritance?
                A switch statement like this?
            2) How you will handle validity of user actions.
            For example, if its not a users turn but their socket sends "BET"
        */
        switch (actionType) {
            case ActionType.StartGame: {
                this.processStartGameMessage(data);
            }
            case ActionType.StopGame: {
                this.processStopGameMessage(data);

            }
            case ActionType.SitDown: {
                this.processSitDownMessage(data);
            }
            case ActionType.StandUp: {
                this.processStandUpMessage(data);
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

    }
    processStandUpMessage(data: any) {

    }

}