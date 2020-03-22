"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
let MessageService = class MessageService {
    processMessage(action) {
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
        console.log("equal?", actionType === "SitDown" /* SitDown */);
        console.log("SitDown" /* SitDown */);
        switch (actionType) {
            case "StartGame" /* StartGame */: {
                return this.processStartGameMessage(data);
            }
            case "StopGame" /* StopGame */: {
                return this.processStopGameMessage(data);
            }
            case "SitDown" /* SitDown */: {
                return this.processSitDownMessage(data);
            }
            case "StandUp" /* StandUp */: {
                return this.processStandUpMessage(data);
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
        return "Received sitdown message";
    }
    processStandUpMessage(data) {
    }
};
MessageService = __decorate([
    typedi_1.Service()
], MessageService);
exports.MessageService = MessageService;
//# sourceMappingURL=messageService.js.map