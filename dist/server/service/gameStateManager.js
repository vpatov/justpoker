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
const deckService_1 = require("./deckService");
let GameStateManager = class GameStateManager {
    constructor(deckService) {
        this.deckService = deckService;
    }
    newGame(players) {
        this.gameState =
            {
                gameState: {
                    players,
                    gameType: "NoLimitTexasHoldEm" /* NoLimitTexasHoldEm */,
                    board: { cards: [] },
                    gameParameters: {
                        smallBlind: 1,
                        bigBlind: 2,
                    }
                },
                deck: this.deckService.newDeck(),
            };
        return this.gameState;
    }
};
GameStateManager = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [deckService_1.DeckService])
], GameStateManager);
exports.GameStateManager = GameStateManager;
// export declare interface SecureGameState {
// gameState: PublicGameState;
// deck: Deck;
//# sourceMappingURL=gameStateManager.js.map