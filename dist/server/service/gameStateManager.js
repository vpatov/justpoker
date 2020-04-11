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
const gameState_1 = require("../models/gameState");
const game_1 = require("../models/game");
const playerService_1 = require("./playerService");
const deckService_1 = require("./deckService");
const util_1 = require("../util/util");
let GameStateManager = class GameStateManager {
    constructor(deckService, playerService) {
        this.deckService = deckService;
        this.playerService = playerService;
    }
    /* Getters */
    getGameState() {
        return this.gameState;
    }
    getConnectedClient(cookie) {
        return this.gameState.table.activeConnections.get(cookie);
    }
    getPlayerByClientUUID(cookie) {
        const connectedClient = this.getConnectedClient(cookie);
        const playerUUID = connectedClient.playerUUID;
        return this.getPlayer(playerUUID);
    }
    getPlayer(playerUUID) {
        return this.gameState.players[playerUUID];
    }
    getCurrentPlayerToAct() {
        return this.gameState.currentPlayerToAct;
    }
    getSB() {
        return this.gameState.gameParameters.smallBlind;
    }
    getBB() {
        return this.gameState.gameParameters.bigBlind;
    }
    // TODO these are unsorted. Make sure thats okay.
    getBettingRoundActions() {
        return Object.values(this.gameState.players)
            .filter(player => player.lastAction)
            .map(player => player.lastAction);
    }
    getBettingRoundStage() {
        return this.gameState.bettingRoundStage;
    }
    getNumberPlayersSitting() {
        return Object.entries(this.gameState.players)
            .filter(([uuid, player]) => player.sitting).length;
    }
    getSeats() {
        const seats = Object.values(this.gameState.players)
            .filter(player => player.seatNumber >= 0)
            .map((player) => [player.seatNumber, player.uuid]);
        seats.sort();
        return seats;
    }
    getDeck() {
        return this.gameState.deck;
    }
    getNextPlayerUUID(currentPlayerUUID) {
        const seats = this.getSeats();
        const currentIndex = seats.findIndex(([seatNumber, uuid]) => uuid === currentPlayerUUID);
        // if input is empty string, then there hasn't been a dealer yet, pick index 0
        const nextIndex = currentPlayerUUID ? (currentIndex + 1) % seats.length : 0;
        const [_, nextPlayerUUID] = seats[nextIndex];
        return nextPlayerUUID;
    }
    isSeatTaken(seatNumber) {
        return Object.entries(this.gameState.players).some(([uuid, player]) => {
            player.seatNumber === seatNumber;
        });
    }
    isValidSeat(seatNumber) {
        return seatNumber >= 0 && seatNumber < this.gameState.gameParameters.maxPlayers;
    }
    isGameInProgress() {
        return this.gameState.gameInProgress;
    }
    /* Initialization methods */
    initConnectedClient(cookie) {
        const client = this.gameState.table.activeConnections.get(cookie);
        if (!client) {
            const newClient = this.playerService.createConnectedClient(cookie);
            this.gameState = Object.assign(Object.assign({}, this.gameState), { table: Object.assign(Object.assign({}, this.gameState.table), { activeConnections: new Map([
                        ...this.gameState.table.activeConnections,
                        [cookie, newClient]
                    ]) }) });
        }
    }
    initGame(newGameForm) {
        this.gameState = Object.assign(Object.assign({}, gameState_1.cleanGameState), { table: this.initTable(newGameForm), gameParameters: {
                smallBlind: newGameForm.smallBlind,
                bigBlind: newGameForm.bigBlind,
                gameType: newGameForm.gameType,
                timeToAct: 30,
                maxPlayers: 9,
            } });
        return this.gameState.table.uuid;
    }
    initTable(newGameForm) {
        // oH nO a pLaiNtEXt pAssW0Rd!!
        return {
            uuid: util_1.generateUUID(),
            activeConnections: new Map(),
            password: newGameForm.password,
        };
    }
    /* Transformers */
    stripSensitiveFields(cookie) {
        const connectedClient = this.getConnectedClient(cookie);
        const clientPlayerUUID = connectedClient.playerUUID;
        const players = Object.fromEntries(Object.entries(this.gameState.players).map(([uuid, player]) => [
            uuid,
            (uuid === clientPlayerUUID ?
                this.getPlayer(uuid) : Object.assign(Object.assign({}, this.getPlayer(uuid)), { holeCards: [] }))
        ]));
        const strippedGameState = Object.assign(Object.assign({}, this.gameState), { players,
            clientPlayerUUID });
        delete strippedGameState.deck;
        delete strippedGameState.table;
        return strippedGameState;
    }
    /* Updaters */
    updateGameParameters(gameParameters) {
        this.gameState = Object.assign(Object.assign({}, this.gameState), { gameParameters: Object.assign({}, gameParameters) });
    }
    /* Player operations */
    associateClientAndPlayer(cookie, player) {
        const connectedClient = this.getConnectedClient(cookie);
        return Object.assign(Object.assign({}, connectedClient), { playerUUID: player.uuid });
    }
    addNewPlayerToGame(clientUUID, name, buyin) {
        const player = this.playerService.createNewPlayer(name, buyin);
        const associatedClient = this.associateClientAndPlayer(clientUUID, player);
        this.gameState = Object.assign(Object.assign({}, this.gameState), { players: Object.assign(Object.assign({}, this.gameState.players), { [player.uuid]: player }), table: Object.assign(Object.assign({}, this.gameState.table), { activeConnections: new Map([
                    ...this.gameState.table.activeConnections,
                    [associatedClient.uuid, associatedClient]
                ]) }) });
    }
    sitDownPlayer(playerUUID, seatNumber) {
        const player = Object.assign(Object.assign({}, this.getPlayer(playerUUID)), { sitting: true, seatNumber });
        const players = Object.assign(Object.assign({}, this.gameState.players), { [player.uuid]: player });
        this.gameState = Object.assign(Object.assign({}, this.gameState), { players });
    }
    standUpPlayer(playerUUID) {
        const player = Object.assign(Object.assign({}, this.getPlayer(playerUUID)), { sitting: false, seatNumber: -1 });
        const players = Object.assign(Object.assign({}, this.gameState.players), { [player.uuid]: player });
        this.gameState = Object.assign(Object.assign({}, this.gameState), { players });
    }
    setNextPlayerToAct() {
        this.gameState = Object.assign(Object.assign({}, this.gameState), { currentPlayerToAct: this.getNextPlayerUUID(this.getCurrentPlayerToAct()) });
    }
    setPlayerLastAction(playerUUID, lastAction) {
        const player = Object.assign(Object.assign({}, this.getPlayer(playerUUID)), { lastAction });
        const players = Object.assign(Object.assign({}, this.gameState.players), { [player.uuid]: player });
        this.gameState = Object.assign(Object.assign({}, this.gameState), { players });
    }
    /* Gameplay functionality */
    // if game is started, and state is waiting, try to initializeGameRound
    // perform this check after every incoming message
    // this way, you don't have to check explicit events
    startGame() {
        // start the timer
        // set the game to in progress
        this.gameState = Object.assign(Object.assign({}, this.gameState), { gameInProgress: true });
    }
    // TODO wipe gameplay game state.
    stopGame() {
        this.gameState = Object.assign(Object.assign({}, this.gameState), { gameInProgress: false });
    }
    // executed after every message processed
    pollForGameContinuation() {
        if (!this.isGameInProgress()) {
            return;
        }
        if (this.getBettingRoundStage() === "WAITING" /* WAITING */) {
            this.startHand();
        }
    }
    initializeDealerButton() {
        const playerUUID = this.getNextPlayerUUID(this.gameState.dealerUUID);
        this.gameState = Object.assign(Object.assign({}, this.gameState), { dealerUUID: playerUUID });
    }
    /*
        TODO ensure that the players have enough to cover the blinds, and if not, put them
        all-in. Don't let a player get this point if they have zero chips, stand them up earlier.
        TODO substract chips from the players
        TODO place blinds correctly when there are only two people
    */
    placeBlinds() {
        const smallBlindUUID = this.getNextPlayerUUID(this.gameState.dealerUUID);
        const bigBlindUUID = this.getNextPlayerUUID(smallBlindUUID);
        const sbPlayer = Object.assign(Object.assign({}, this.getPlayer(smallBlindUUID)), { lastAction: {
                type: "BET" /* BET */,
                amount: this.getSB(),
                allin: false
            } });
        const bbPlayer = Object.assign(Object.assign({}, this.getPlayer(bigBlindUUID)), { lastAction: {
                type: "BET" /* BET */,
                amount: this.getBB(),
                allin: false
            } });
        const firstToActPreflop = this.getNextPlayerUUID(bigBlindUUID);
        this.gameState = Object.assign(Object.assign({}, this.gameState), { 
            // players: { ...this.gameState.players, [sbPlayer.uuid]: sbPlayer, [bbPlayer.uuid]: bbPlayer },
            currentPlayerToAct: firstToActPreflop });
    }
    startHand() {
        // if less than 2 people are sitting, do nothing
        if (this.getNumberPlayersSitting() >= 2) {
            this.initializeDealerButton();
            this.initializePreflop();
        }
    }
    initializePreflop() {
        this.placeBlinds();
        const deck = this.deckService.newDeck();
        this.gameState = Object.assign(Object.assign({}, this.gameState), { deck, bettingRoundStage: "PREFLOP" /* PREFLOP */ });
        this.distributeHoleCards();
    }
    distributeHoleCards() {
        const deck = this.getDeck();
        const players = Object.fromEntries(Object.entries(this.gameState.players).map(([uuid, player]) => [
            uuid,
            player.sitting ? Object.assign(Object.assign({}, player), { holeCards: [
                    this.deckService.drawCard(deck),
                    this.deckService.drawCard(deck),
                ] }) :
                player
        ]));
        this.gameState = Object.assign(Object.assign({}, this.gameState), { players });
    }
    /* FLOP */
    dealFlop() {
        const deck = this.getDeck();
        this.gameState = Object.assign(Object.assign({}, this.gameState), { board: {
                cards: [
                    // TODO make this variant agnostic
                    this.deckService.drawCard(deck),
                    this.deckService.drawCard(deck),
                    this.deckService.drawCard(deck),
                ]
            }, deck, bettingRoundStage: "FLOP" /* FLOP */ });
    }
    /* Betting Round Actions */
    performBettingRoundAction(action) {
        switch (action.type) {
            case "CHECK" /* CHECK */: {
                this.check();
                break;
            }
        }
        if (this.haveAllPlayersActed()) {
            this.finishBettingRound();
            if (!this.currentHandHasResult()) {
                this.nextBettingRound();
            }
        }
        else {
            this.setNextPlayerToAct();
        }
    }
    check() {
        const currentPlayerToAct = this.getCurrentPlayerToAct();
        this.setPlayerLastAction(currentPlayerToAct, game_1.CHECK_ACTION);
    }
    haveAllPlayersActed() {
        /*
            Everyone has gone if:
            For every player that is not folded,
                they have either matched the highest bet,
                or they are all-in.
        */
        return false;
    }
    currentHandHasResult() {
        return false;
    }
    finishBettingRound() {
        // put all bets in pot
        // clear the player to act
        // check for victory condition:
        // either everyone folded but one person,
        // or this is the river and its time for showdown
        // if someone wins, add the hand result to the gameState (UI shows victory)
    }
    nextBettingRound() {
    }
};
GameStateManager = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [deckService_1.DeckService,
        playerService_1.PlayerService])
], GameStateManager);
exports.GameStateManager = GameStateManager;
//# sourceMappingURL=gameStateManager.js.map