"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const util_1 = require("../util/util");
// TODO design functions here such that they receive as input
// the players object, and return as output the players object
let PlayerService = class PlayerService {
    createNewPlayer(name, chips) {
        return {
            uuid: util_1.generateUUID(),
            name,
            chips,
            holeCards: [],
            sitting: false,
            inHand: false,
            seatNumber: -1,
            lastAction: null,
        };
    }
    createConnectedClient(clientUUID) {
        return {
            uuid: clientUUID,
            playerUUID: ''
        };
    }
};
PlayerService = __decorate([
    typedi_1.Service()
], PlayerService);
exports.PlayerService = PlayerService;
//# sourceMappingURL=playerService.js.map