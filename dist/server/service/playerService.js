"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
let PlayerService = class PlayerService {
    /*
    connectedPlayers = new BehaviorSubject<Map<string, Player>>(new Map());

    async createNewPlayer1(name: string) {

        const players = await this.connectedPlayers.getValue();

        let uuid = generateUUID();
        while (players.has(uuid)) {
            uuid = generateUUID();
        }
        const newPlayer = {
            name,
            uuid,
        };
        players.set(uuid, newPlayer);
        this.connectedPlayers.next(players);
        return newPlayer;
    }
    */
    createNewPlayer(name, chips) {
        return {
            name,
            chips,
            holeCards: [],
            sitting: false
        };
    }
    // TODO determine if usage of redux style object spread is anti-pattern here
    addPlayerChips(player, amount) {
        return Object.assign(Object.assign({}, player), { chips: player.chips + amount });
    }
};
PlayerService = __decorate([
    typedi_1.Service()
], PlayerService);
exports.PlayerService = PlayerService;
//# sourceMappingURL=playerService.js.map