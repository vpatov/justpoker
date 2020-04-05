"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const util_1 = require("../util/util");
const rxjs_1 = require("rxjs");
let PlayerService = class PlayerService {
    constructor() {
        this.connectedPlayers = new rxjs_1.BehaviorSubject(new Map());
    }
    createNewPlayer(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield this.connectedPlayers.getValue();
            let uuid = util_1.generateUUID();
            while (players.has(uuid)) {
                uuid = util_1.generateUUID();
            }
            const newPlayer = {
                name,
                uuid,
            };
            players.set(uuid, newPlayer);
            this.connectedPlayers.next(players);
            return newPlayer;
        });
    }
    /*
        Upon loading the frontend app, frontend looks up our cookie.
        1) If it can't find it, it creates a new WSconnection and cookie
        2) If it finds it, it reuses the cookie and WSconnects with it.

        It is probably best to make the code path for creating a websocket
        connection the same, regardless of whether client is host creating
        a table, or someone else joining existing table.

        Therefore, post request for new table should generate
        a table ID and url.
    */
    createNewConnectedClient() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
};
PlayerService = __decorate([
    typedi_1.Service()
], PlayerService);
exports.PlayerService = PlayerService;
//# sourceMappingURL=playerService.js.map