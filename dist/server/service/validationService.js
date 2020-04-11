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
const gameStateManager_1 = require("./gameStateManager");
/*
    TODO: Redesign error message construction
    TODO: Split methods into validateAction and ensureCondition
        - validateAction methods called externall, ensureCondition methods called internally
*/
const MAX_NAME_LENGTH = 32;
let ValidationService = class ValidationService {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
    }
    ensureClientExists(clientUUID) {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        if (!client) {
            throw Error(`Client ${clientUUID} does not exist.`);
        }
    }
    ensureClientIsInGame(clientUUID) {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        if (!client.playerUUID) {
            throw Error(`Client ${clientUUID} has not joined the game.`);
        }
        const player = this.gameStateManager.getPlayer(client.playerUUID);
        if (!player) {
            throw Error(`Player ${client.playerUUID} does not exist.`);
        }
    }
    ensureClientIsNotInGame(clientUUID) {
        const client = this.gameStateManager.getConnectedClient(clientUUID);
        if (client.playerUUID) {
            throw Error(`Client ${clientUUID} already has player association: ${client.playerUUID}`);
        }
    }
    ensurePlayerIsSitting(playerUUID) {
        const player = this.gameStateManager.getPlayer(playerUUID);
        if (!player.sitting) {
            throw Error(`Player is not sitting:\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`);
        }
    }
    ensurePlayerIsStanding(playerUUID) {
        const player = this.gameStateManager.getPlayer(playerUUID);
        if (player.sitting) {
            throw Error(`Player is not standing:\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`);
        }
    }
    // TODO can probably use string templates in a more elegant way to handle errorPrefix
    ensureCorrectPlayerToAct(clientUUID) {
        this.ensureClientIsInGame(clientUUID);
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        this.ensurePlayerIsSitting(player.uuid);
        const currentPlayerToAct = this.gameStateManager.getCurrentPlayerToAct();
        if (player.uuid !== currentPlayerToAct) {
            throw Error(`Not your turn!\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`);
        }
    }
    validateJoinTableRequest(clientUUID, request) {
        this.ensureClientIsNotInGame(clientUUID);
        if (request.name.length > MAX_NAME_LENGTH) {
            throw Error(`Name ${request.name} is too long - exceeds limit of 32 characters.`);
        }
    }
    validateSitDownRequest(clientUUID, request) {
        this.ensureClientIsInGame(clientUUID);
        const seatNumber = request.seatNumber;
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const errorPrefix = `Cannot SitDown\nplayerUUID: ${player.uuid}\nname: ${player.name}\n`;
        this.ensurePlayerIsStanding(player.uuid);
        if (player.chips <= 0) {
            throw Error(`${errorPrefix} Player needs chips to sit down.`);
        }
        if (!this.gameStateManager.isValidSeat(seatNumber)) {
            throw Error(`${errorPrefix} Seat ${seatNumber} is not a valid seat.`);
        }
        if (this.gameStateManager.isSeatTaken(seatNumber)) {
            throw Error(`${errorPrefix} Seat ${seatNumber} is taken. Please pick another`);
        }
    }
    validateStandUpRequest(clientUUID) {
        this.ensureClientIsInGame(clientUUID);
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        this.ensurePlayerIsSitting(player.uuid);
    }
    validateStartGameRequest(clientUUID) {
        // TODO validate that client is admin
        if (this.gameStateManager.isGameInProgress()) {
            throw Error(`Cannot StartGame: Game is already in progress.`);
        }
    }
    validateStopGameRequest(clientUUID) {
        // TODO validate that client is admin
        if (!this.gameStateManager.isGameInProgress()) {
            throw Error(`Cannot StopGame: Game is not in progress.`);
        }
    }
    validateCheckAction(clientUUID) {
        this.ensureCorrectPlayerToAct(clientUUID);
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        const bettingRoundActions = this.gameStateManager.getBettingRoundActions();
        for (const action of bettingRoundActions) {
            if (action.type === "BET" /* BET */) {
                throw Error(`You cannot check when someone before you has bet.`);
            }
        }
    }
};
ValidationService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [gameStateManager_1.GameStateManager])
], ValidationService);
exports.ValidationService = ValidationService;
//# sourceMappingURL=validationService.js.map