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
const game_1 = require("../models/game");
const gameStateManager_1 = require("./gameStateManager");
const playerService_1 = require("./playerService");
const validationService_1 = require("./validationService");
const typedi_1 = require("typedi");
let MessageService = class MessageService {
    constructor(playerService, gameStateManager, validationService) {
        this.playerService = playerService;
        this.gameStateManager = gameStateManager;
        this.validationService = validationService;
    }
    processGameStateForUI(gameState) {
        // need to define translation!!
        const UIState = {
            missionControl: {
                heroStack: 0,
                pot: 0,
            },
            table: {
                spots: 9,
                pot: 0,
                communityCards: [],
                players: [],
            },
        };
        return UIState;
    }
    getGameStateMessageForUI() {
        const gs = this.gameStateManager.getGameState();
        const gsUI = this.processGameStateForUI(gs);
        return { game: gsUI };
    }
    processMessage(action, clientUUID) {
        const actionType = action.actionType;
        const data = action.data;
        this.validationService.ensureClientExists(clientUUID);
        switch (actionType) {
            case "StartGame" /* StartGame */: {
                this.processStartGameMessage(clientUUID);
                break;
            }
            case "StopGame" /* StopGame */: {
                this.processStopGameMessage(clientUUID);
                break;
            }
            case "SitDown" /* SitDown */: {
                this.processSitDownMessage(clientUUID, data);
                break;
            }
            case "StandUp" /* StandUp */: {
                this.processStandUpMessage(clientUUID);
                break;
            }
            case "JoinTable" /* JoinTable */: {
                this.processJoinTableMessage(clientUUID, data);
                break;
            }
            case "Check" /* Check */: {
                this.processCheckMessage(clientUUID);
            }
            case "PingState" /* PingState */: {
                break;
            }
        }
        this.gameStateManager.pollForGameContinuation();
        return this.gameStateManager.stripSensitiveFields(clientUUID);
    }
    // Preconditions: at least two players are sitting down.
    processStartGameMessage(clientUUID) {
        this.validationService.validateStartGameRequest(clientUUID);
        this.gameStateManager.startGame();
    }
    // Preconditions: the game is in progress.
    processStopGameMessage(clientUUID) {
        this.validationService.validateStopGameRequest(clientUUID);
        this.gameStateManager.stopGame();
    }
    processSitDownMessage(clientUUID, request) {
        this.validationService.validateSitDownRequest(clientUUID, request);
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        this.gameStateManager.sitDownPlayer(player.uuid, request.seatNumber);
    }
    processStandUpMessage(clientUUID) {
        this.validationService.validateStandUpRequest(clientUUID);
        const player = this.gameStateManager.getPlayerByClientUUID(clientUUID);
        this.gameStateManager.standUpPlayer(player.uuid);
    }
    processJoinTableMessage(clientUUID, request) {
        this.validationService.validateJoinTableRequest(clientUUID, request);
        const gameState = this.gameStateManager.addNewPlayerToGame(clientUUID, request.name, request.buyin);
    }
    // TODO perhaps create one actionType for a gamePlayAction, and then validate to make sure
    // that only messages from the current player to act are processed.
    processCheckMessage(clientUUID) {
        this.validationService.validateCheckAction(clientUUID);
        this.gameStateManager.performBettingRoundAction(game_1.CHECK_ACTION);
    }
};
MessageService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [playerService_1.PlayerService,
        gameStateManager_1.GameStateManager,
        validationService_1.ValidationService])
], MessageService);
exports.MessageService = MessageService;
//# sourceMappingURL=messageService.js.map