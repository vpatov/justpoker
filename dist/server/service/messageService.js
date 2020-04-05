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
const tableService_1 = require("./tableService");
const connectionService_1 = require("./connectionService");
const playerService_1 = require("./playerService");
const typedi_1 = require("typedi");
let MessageService = class MessageService {
    constructor(tableService, connectionService, playerService) {
        this.tableService = tableService;
        this.connectionService = connectionService;
        this.playerService = playerService;
    }
    processMessage(action, cookie) {
        const actionType = action.actionType;
        const data = action.data;
        const connectedClient = this.connectionService.getConnectedClient(cookie, false);
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
            case "JoinTable" /* JoinTable */: {
                return this.processJoinTableMessage(data, connectedClient);
            }
        }
    }
    processStartGameMessage(data) {
        return "Received start game message";
    }
    processStopGameMessage(data) {
        return "Received stop game message";
    }
    processSitDownMessage(data) {
        return "Received sitdown message";
    }
    processStandUpMessage(data) {
        return "Received stand up message";
    }
    processJoinTableMessage(data, client) {
        const player = this.playerService.createNewPlayer(data.name, data.buyin);
        client.gamePlayer = player;
        return `Welcome to the table ${player.name}`;
    }
};
MessageService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [tableService_1.TableService,
        connectionService_1.ConnectionService,
        playerService_1.PlayerService])
], MessageService);
exports.MessageService = MessageService;
//# sourceMappingURL=messageService.js.map