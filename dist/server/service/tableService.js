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
const typedi_1 = require("typedi");
const playerService_1 = require("./playerService");
const gameStateManager_1 = require("./gameStateManager");
const util_1 = require("../util/util");
let TableService = class TableService {
    constructor(playerService, gameStateManager) {
        this.playerService = playerService;
        this.gameStateManager = gameStateManager;
    }
    getTable() {
        return this.table;
    }
    // for now there is only one table object
    // in future this will be called createTable
    initTable(newTableForm) {
        const uuid = util_1.generateUUID();
        this.gameStateManager.initGameState();
        this.gameStateManager.updateGameParameters({
            smallBlind: newTableForm.smallBlind,
            bigBlind: newTableForm.bigBlind,
            gameType: newTableForm.gameType,
        });
        // oH nO a pLaiNtEXt pAssW0Rd!!
        this.table = {
            uuid,
            activeConnections: new Map(),
            password: newTableForm.password,
        };
        return uuid;
    }
};
TableService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [playerService_1.PlayerService,
        gameStateManager_1.GameStateManager])
], TableService);
exports.TableService = TableService;
//# sourceMappingURL=tableService.js.map