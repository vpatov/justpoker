"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wsaction_1 = require("./models/wsaction");
class MessageHandler {
    processMessage(actionType, data) {
        /* things to think about:
            1) Best abstraction for message handling delegation. Services with DI? Inheritance?
                A switch statement like this?
            2) How you will handle validity of user actions.
            For example, if its not a users turn but their socket sends "BET"
        */
        switch (actionType) {
            case wsaction_1.ActionType.StartGame: {
                this.processStartGameMessage(data);
            }
            case wsaction_1.ActionType.StopGame: {
                this.processStopGameMessage(data);
            }
            case wsaction_1.ActionType.SitDown: {
                this.processSitDownMessage(data);
            }
            case wsaction_1.ActionType.StandUp: {
                this.processStandUpMessage(data);
            }
        }
    }
    processStartGameMessage(data) { }
    processStopGameMessage(data) { }
    // how will this interact with the game?
    // will each instance of node be handling one game?
    // for now, and mvp, assume just one game.
    // can communicate via DI to gameService
    processSitDownMessage(data) {
    }
    processStandUpMessage(data) {
    }
}
//# sourceMappingURL=messageHandler.js.map