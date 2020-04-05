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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
let TableService = class TableService {
    constructor(playerService, gameStateManager) {
        this.playerService = playerService;
        this.gameStateManager = gameStateManager;
    }
    // for now there is only one table object
    initTable(newTableForm) {
        this.table = Object.assign({}, cleanTable);
    }
};
TableService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [typeof (_a = typeof PlayerService !== "undefined" && PlayerService) === "function" ? _a : Object, typeof (_b = typeof GameStateManager !== "undefined" && GameStateManager) === "function" ? _b : Object])
], TableService);
exports.TableService = TableService;
//# sourceMappingURL=connectionService.js.map