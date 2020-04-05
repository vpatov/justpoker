import { Service } from "typedi";
import { GameState, cleanGameState } from '../models/gameState';
import { StraddleType, GameType, GameParameters, } from '../models/game';
import { NewGameForm, ConnectedClient } from '../models/table';
import { Player } from '../models/player';
import { PlayerService } from './playerService';
import { DeckService } from './deckService';
import { generateUUID } from '../util/util';

// TODO gameState updates should return gameState
// TODO validations dont return game state but return booleans, thus
// they should probably go in a different file?


// all dependencies of gameState should only be called by gamestate
// functionality of all dependencies of gameStateManager could be placed
// in gameStateManager, but this is avoided only for code clarity /modularity

@Service()
export class GameStateManager {

    gameState: Readonly<GameState>;

    constructor(
        private readonly deckService: DeckService,
        private readonly playerService: PlayerService) { }

    getGameState(): GameState {
        return this.gameState;
    }

    initGame(newGameForm: NewGameForm) {

        this.gameState = {
            ...cleanGameState,
            table: this.initTable(newGameForm),
            gameParameters: {
                smallBlind: newGameForm.smallBlind,
                bigBlind: newGameForm.bigBlind,
                gameType: newGameForm.gameType
            }
        };
        return this.gameState.table.uuid;
    }

    initTable(newGameForm: NewGameForm) {

        // oH nO a pLaiNtEXt pAssW0Rd!!
        return {
            uuid: generateUUID(),
            activeConnections: new Map(),
            password: newGameForm.password,
        };
    }

    updateGameParameters(gameParameters: GameParameters) {
        this.gameState = {
            ...this.gameState,
            gameParameters: {
                ...gameParameters
            }
        };
        return this.gameState;
    }

    initConnectedClient(cookie: string) {
        const client = this.gameState.table.activeConnections.get(cookie);
        if (!client) {
            const newClient = this.createConnectedClient(cookie);
            this.gameState = {
                ...this.gameState,
                table: {
                    ...this.gameState.table,
                    activeConnections: new Map([
                        ...this.gameState.table.activeConnections,
                        [cookie, newClient]
                    ])
                }
            }
        }
        return this.gameState;
    }

    getConnectedClient(cookie: string) {
        const client = this.gameState.table.activeConnections.get(cookie);
        if (!client) {
            throw Error(`Client ${cookie} does not exist.`);
        }
        return client;
    }

    createConnectedClient(cookie: string): ConnectedClient {
        return {
            cookie,
            gamePlayer: ''
        };
    }

    associateClientAndPlayer(connectedClient: ConnectedClient, player: Player) {
        if (connectedClient.gamePlayer) {
            throw Error("The client already has a player association.");
        }
        return {
            ...connectedClient,
            gamePlayer: player.uuid
        };
    }

    addNewPlayerToGame(client: ConnectedClient, name: string, buyin: number) {
        const player = this.playerService.createNewPlayer(name, buyin);
        this.associateClientAndPlayer(client, player);
        this.gameState = {
            ...this.gameState,
            players: { ...this.gameState.players, [player.uuid]: player }
        };
        return this.gameState;
    }


    // TODO implement
    isSeatTaken(seatNumber: number) {
        return false;
    }

    // TODO implement
    isValidSeat(seatNumber: number) {
        return true;
    }

    // TODO think about clean way to mutate player state.
    // Perhaps gameState object should be brand new, but player
    // objects can be recycled?
    // TODO when keeping game state history,
    // keep json record not literal record
    sitDownPlayer(client: ConnectedClient, seatNumber: number) {
        const player = {
            ...this.gameState.players.get(client.gamePlayer),
            sitting: true
        };
        this.gameState = {
            ...this.gameState,
            players: { ...this.gameState.players, [player.uuid]: player }
        };
        return this.gameState;
    }

    /*
    export declare interface GameState {
        players: ReadonlyArray<Player>;
        board: Readonly<Board>;
        gameParameters: Readonly<GameParameters>;
        dealerPlayer: Readonly<Player> | null;
        bigBlindPlayer: Readonly<Player> | null;
        smallBlindPlayer: Readonly<Player> | null;
        currentBettingRound: Readonly<BettingRound>;
        deck: Readonly<Deck>;
    }
    */

    /*
    export declare interface Player {
        name: string;
        chips: number;
        holeCards: Card[];
        sitting: boolean;
    }
    */
}

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