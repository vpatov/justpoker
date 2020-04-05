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
const playerService_1 = require("./playerService");
const deckService_1 = require("./deckService");
const util_1 = require("../util/util");
// TODO gameState updates should return gameState
// TODO validations dont return game state but return booleans, thus
// they should probably go in a different file?
// all dependencies of gameState should only be called by gamestate
// functionality of all dependencies of gameStateManager could be placed
// in gameStateManager, but this is avoided only for code clarity /modularity
let GameStateManager = class GameStateManager {
    constructor(deckService, playerService) {
        this.deckService = deckService;
        this.playerService = playerService;
    }
    getGameState() {
        return this.gameState;
    }
    initGame(newGameForm) {
        this.gameState = Object.assign(Object.assign({}, gameState_1.cleanGameState), { table: this.initTable(newGameForm), gameParameters: {
                smallBlind: newGameForm.smallBlind,
                bigBlind: newGameForm.bigBlind,
                gameType: newGameForm.gameType
            } });
    }
    initTable(newGameForm) {
        // oH nO a pLaiNtEXt pAssW0Rd!!
        return {
            uuid: util_1.generateUUID(),
            activeConnections: new Map(),
            password: newGameForm.password,
        };
    }
    updateGameParameters(gameParameters) {
        this.gameState = Object.assign(Object.assign({}, this.gameState), { gameParameters: Object.assign({}, gameParameters) });
        return this.gameState;
    }
    initConnectedClient(cookie) {
        const client = this.gameState.table.activeConnections.get(cookie);
        if (!client) {
            const newClient = this.createConnectedClient(cookie);
            this.gameState = Object.assign(Object.assign({}, this.gameState), { table: Object.assign(Object.assign({}, this.gameState.table), { activeConnections: new Map([
                        ...this.gameState.table.activeConnections,
                        [cookie, newClient]
                    ]) }) });
        }
        return this.gameState;
    }
    getConnectedClient(cookie) {
        const client = this.gameState.table.activeConnections.get(cookie);
        if (!client) {
            throw Error(`Client ${cookie} does not exist.`);
        }
        return client;
    }
    createConnectedClient(cookie) {
        return {
            cookie,
            gamePlayer: ''
        };
    }
    associateClientAndPlayer(connectedClient, player) {
        if (connectedClient.gamePlayer) {
            throw Error("The client already has a player association.");
        }
        return Object.assign(Object.assign({}, connectedClient), { gamePlayer: player.uuid });
    }
    addNewPlayerToGame(client, name, buyin) {
        const player = this.playerService.createNewPlayer(name, buyin);
        this.associateClientAndPlayer(client, player);
        this.gameState = Object.assign(Object.assign({}, this.gameState), { players: Object.assign(Object.assign({}, this.gameState.players), { [player.uuid]: player }) });
        return this.gameState;
    }
    // TODO implement
    isSeatTaken(seatNumber) {
        return false;
    }
    // TODO implement
    isValidSeat(seatNumber) {
        return true;
    }
    // TODO think about clean way to mutate player state.
    // Perhaps gameState object should be brand new, but player
    // objects can be recycled?
    // TODO when keeping game state history,
    // keep json record not literal record
    sitDownPlayer(client, seatNumber) {
        const player = Object.assign(Object.assign({}, this.gameState.players.get(client.gamePlayer)), { sitting: true });
        this.gameState = Object.assign(Object.assign({}, this.gameState), { players: Object.assign(Object.assign({}, this.gameState.players), { [player.uuid]: player }) });
        return this.gameState;
    }
};
GameStateManager = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [deckService_1.DeckService,
        playerService_1.PlayerService])
], GameStateManager);
exports.GameStateManager = GameStateManager;
// TODO
// https://github.com/goldfire/pokersolver
/*
    Model distinctions:

    ConnectedClient - sever-side obj that represents a client that has loaded
    the frontend and has connected to the server via WS.

    GamePlayer - server-side obj that represents an actual game player that has
    hole cards, a stack, a name, etc.

    Websocket Connection - the actual WS connection (tuple of IP_Address/port)

    A ConnectedClient may or may not be associated with a GamePlayer. For
    example, a spectator will not have a GamePlayer association. This way, they
    can use the websocket connection to spectate in real-time. If they choose to
    sit down, the server will create a GamePlayer and associate the two, and the
    user can now play (using the same WS connection and same cookie).


    Connection sequence/plan:

    1)  User visits app website, where they can fill out a new table form.
    2)  User fills out form, submits to server via POST request
        form contains (at least):
            - gameType
            - blinds
            - admin password
            - (optional) admin responsibilities
                - admin must control buy-ins?
                - admin must approve new players?

    3)  Server creates new table with specified params.
        Server generates unique URL, and makes table accessible at that URL,
        and sends the URL as a response to the post request.

    4)  Client page redirects user to the new game URL, which has the main
        game frontend application.


    5) Websocket Connection Setup

        Client:
        The client tries to estalish a websocket connection with the server.
        It will first try to find the "JustPoker" cookie.
        if (cookie is found){
            connectionCookie = cookie we just found.
        }
        else {
            connectionCookie = cookie (uuid) generated by client (frontend app)
        }

        Attempt to connect to server and pass connectionCookie in the header of
        the websocket connection request.

        Server:
        Upon receiving a connection request from the client, the server looks at
        the cookie and sees if it already has a player associated with that
        cookie.
        If (association found){
            Retrieve the ConnectedClient object (which already has associations
            with a game player) and associate it with the websocket connection
        }
        else {
            Create new ConnectedClient for the connection and associate it with
            the websocket connection.
        }


    6)  The user is now connected to the server via WS, and is able to see the
        game state update in realtime. At this point, all communication with the
        server is done via websockets.

        If (association was found && player was already in game){
            player is in game
        }

        Otherwise, if this is the first time that the player has navigated to
        the table URL (that is, they haven't joined the game yet, or they
        weren't in the game when they last accessed the UI), then they are not
        in the game. Table creation, navigating to table URL, and joining are
        separate actions. Only if you are already in game is navigating to table
        URL and joining done simultaneously.

        User can now click a button to join the game. Upon requesting to join
        the user is asked to provide the following information:

           Name - The player's display name.
           Buy-In - The amount of big blinds the user wants to buy in for.
           Admin? - True if requesting to join as admin. When table has no
               players, default is true. Otherwise default is false.
           SitDown? True if user wants to sit down right away. Default is true.
           Password - if user is joining as admin, they provide the passwd here

        The user submits the request to join the game over the WS connection.

        If (user is joining as an admin){
            If (correct password){
                server grants the request and updates the game state
            }
            else {
                return failure message "incorrect password"
            }
        }

        else {
            If (table requires admins to approve new players){
                server sends new player request to admins and waits for approval
            }
            else {
                server grants the request and updates the game state
            }
        }

    7) The user has joined the game. If they are not yet sitting, they can sit
    down, and play hands. If they are admin, they can perform administrative
    tasks, etc.
*/ 
//# sourceMappingURL=gameStateManager.js.map