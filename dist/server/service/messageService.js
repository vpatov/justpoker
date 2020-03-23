"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameService_1 = require("./gameService");
const typedi_1 = require("typedi");
let MessageService = class MessageService {
    constructor(gameService) {
        this.gameService = gameService;
    }
    processMessage(action) {
        const actionType = action.actionType;
        const data = action.data;
        /* things to think about:
            1) Best abstraction for message handling delegation. Services with DI? Inheritance?
                A switch statement like this?
            2) How you will handle validity of user actions.
            For example, if its not a users turn but their socket sends "BET"
            3) How to handle returning responses?
            4) Where is the game state going to be? Is there one game state? For now assume one game state
        */
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
            // if games are identified by URL, and are non-private, then this isn't necessary.
            // Also, this probably shouldn't be a socket action.
            // case ActionType.JoinRoom: {
            //     return this.processJoinRoomMessage(data);
            // }
            // should room be created via http request or through websocket?
        }
    }
    processStartGameMessage(data) {
        return "Received start game message";
    }
    processStopGameMessage(data) {
        return "Received stop game message";
    }
    // how will this interact with the game?
    // will each instance of node be handling one game?
    // for now, and mvp, assume just one game.
    // can communicate via DI to gameService
    processSitDownMessage(data) {
        return "Received sitdown message";
    }
    processStandUpMessage(data) {
        return "Received stand up message";
    }
};
MessageService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [gameService_1.GameService])
], MessageService);
exports.MessageService = MessageService;
//# sourceMappingURL=messageService.js.map