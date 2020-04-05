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
const gameStateManager_1 = require("./gameStateManager");
const playerService_1 = require("./playerService");
const typedi_1 = require("typedi");
let MessageService = class MessageService {
    constructor(playerService, gameStateManager) {
        this.playerService = playerService;
        this.gameStateManager = gameStateManager;
    }
    processMessage(action, cookie) {
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
            case "StartGame" /* StartGame */: {
                return this.processStartGameMessage(data);
            }
            case "StopGame" /* StopGame */: {
                return this.processStopGameMessage(data);
            }
            case "SitDown" /* SitDown */: {
                return this.processSitDownMessage(data, client);
            }
            case "StandUp" /* StandUp */: {
                return this.processStandUpMessage(data);
            }
            case "JoinTable" /* JoinTable */: {
                return this.processJoinTableMessage(data, client);
            }
        }
    }
    // Preconditions: at least two players are sitting down.
    processStartGameMessage(data) {
        return "Received start game message";
    }
    // Preconditions: the game is in progress.
    processStopGameMessage(data) {
        return "Received stop game message";
    }
    // Preconditions:
    // client has player
    // player has chips
    // seat is valid seat
    // seat isn't taken
    processSitDownMessage(request, client) {
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
    processStandUpMessage(data) {
        return "Received stand up message";
    }
    // Preconditions: connectedClient.gamePlayer == null
    processJoinTableMessage(data, client) {
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
};
MessageService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [playerService_1.PlayerService,
        gameStateManager_1.GameStateManager])
], MessageService);
exports.MessageService = MessageService;
//# sourceMappingURL=messageService.js.map