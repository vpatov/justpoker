import { Service } from "typedi";
import { GameState, cleanGameState } from '../models/gameState';
import { StraddleType, GameType, GameParameters, } from '../models/game';
import { NewGameForm, ConnectedClient } from '../models/table';
import { Player } from '../models/player';
import { PlayerService } from './playerService';
import { DeckService } from './deckService';
import { generateUUID } from '../util/util';


// all dependencies of gameState should only be called by gamestate
// functionality of all dependencies of gameStateManager could be placed
// in gameStateManager, but this is avoided only for code clarity /modularity

/*

*/

@Service()
export class GameStateManager {

    private gameState: Readonly<GameState>;
    private gameTimer: NodeJS.Timer;

    constructor(
        private readonly deckService: DeckService,
        private readonly playerService: PlayerService) { }

    /* Getters */

    getGameState(): GameState {
        return this.gameState;
    }

    getConnectedClient(cookie: string) {
        return this.gameState.table.activeConnections.get(cookie);
    }

    getPlayerByClientUUID(cookie: string): Player {
        const connectedClient = this.getConnectedClient(cookie);
        const playerUUID = connectedClient.playerUUID;
        return this.getPlayer(playerUUID);
    }

    getPlayer(playerUUID: string): Player {
        return this.gameState.players[playerUUID];
    }

    isSeatTaken(seatNumber: number) {
        return Object.entries(this.gameState.players).some(([uuid, player]) => {
            player.seatNumber === seatNumber
        });
    }

    isValidSeat(seatNumber: number) {
        return seatNumber >= 0 && seatNumber < this.gameState.gameParameters.maxPlayers;
    }

    isGameInProgress() {
        return this.gameState.gameInProgress;
    }


    /* Initialization methods */

    initConnectedClient(cookie: string) {
        const client = this.gameState.table.activeConnections.get(cookie);
        if (!client) {
            const newClient = this.playerService.createConnectedClient(cookie);
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

    initGame(newGameForm: NewGameForm) {
        this.gameState = {
            ...cleanGameState,
            table: this.initTable(newGameForm),
            gameParameters: {
                smallBlind: newGameForm.smallBlind,
                bigBlind: newGameForm.bigBlind,
                gameType: newGameForm.gameType,
                timeToAct: 30,
                maxPlayers: 9,
                // consider adding timeToAct and maxPlayers to form
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

    /* Transformers */

    stripSensitiveFields(cookie: string) {
        const connectedClient = this.getConnectedClient(cookie);
        const clientPlayerUUID = connectedClient.playerUUID;

        const players = Object.fromEntries(Object.entries(this.gameState.players).map(
            ([uuid, player]) => [
                uuid,
                (uuid === clientPlayerUUID ?
                    this.getPlayer(uuid) :
                    { ...this.getPlayer(uuid), holeCards: [] })
            ]
        ));

        const strippedGameState = {
            ...this.gameState,
            players,
            clientPlayerUUID

        };

        delete strippedGameState.deck;
        delete strippedGameState.table;

        return strippedGameState;
    }

    /* Updaters */

    updateGameParameters(gameParameters: GameParameters) {
        this.gameState = {
            ...this.gameState,
            gameParameters: {
                ...gameParameters
            }
        };
        return this.gameState;
    }


    associateClientAndPlayer(cookie: string, player: Player): ConnectedClient {
        const connectedClient = this.getConnectedClient(cookie);
        return {
            ...connectedClient,
            playerUUID: player.uuid
        };
    }

    addNewPlayerToGame(clientUUID: string, name: string, buyin: number) {
        const player = this.playerService.createNewPlayer(name, buyin);
        const associatedClient = this.associateClientAndPlayer(clientUUID, player);
        this.gameState = {
            ...this.gameState,
            players: { ...this.gameState.players, [player.uuid]: player },
            table: {
                ...this.gameState.table,
                activeConnections: new Map([
                    ...this.gameState.table.activeConnections,
                    [associatedClient.uuid, associatedClient]
                ])
            }
        };
        return this.gameState;
    }

    // dealer is position X, SB X+1, BB X+2 (wrap around)
    sitDownPlayer(playerUUID: string, seatNumber: number) {

        const player = {
            ...this.getPlayer(playerUUID),
            sitting: true,
            seatNumber,
        };
        const players = { ...this.gameState.players, [player.uuid]: player };

        this.gameState = {
            ...this.gameState,
            players,
        };
        return this.gameState;
    }

    standUpPlayer(playerUUID: string) {
        const player = {
            ...this.getPlayer(playerUUID),
            sitting: false,
            seatNumber: -1
        };
        const players = { ...this.gameState.players, [player.uuid]: player };

        this.gameState = {
            ...this.gameState,
            players,
        };
        return this.gameState;
    }



    // change betting round to preflop
    // start timer
    startGame(cookie: string) {
        if (this.gameState.gameInProgress) {
            throw Error(`Cannot start game, game is already in progress.`);
        }
        this.gameState = {
            ...this.gameState,
            gameInProgress: true,
        };

        this.startGameTimer();

        // TODO this shouldnt stay in this method
        this.initializePreflop();

        return this.gameState;
    }


    initializePreflop() {
        const deck = this.deckService.newDeck();
        const players = Object.fromEntries(Object.entries(this.gameState.players).map(
            ([uuid, player]) => [
                uuid,
                player.sitting ?
                    {
                        ...player,
                        holeCards: [
                            this.deckService.drawCard(deck),
                            this.deckService.drawCard(deck),
                        ]
                    } :
                    player
            ]
        ));

        this.gameState = {
            ...this.gameState,
            deck,
            players
        };
    }

    // the UI should make it seem like user has X seconds to act, but the server
    // will allow X + 2 seconds to make up for network issues

    // There should be one global timer, and that is the only timer that is running.
    startGameTimer() {
        const serverTime = Date.now();
        this.gameState = {
            ...this.gameState,
            serverTime
        };

        this.gameTimer = setTimeout(
            this.timerFunc, this.gameState.gameParameters.timeToAct);
    }

    // looks at game state and determines
    timerFunc() {

    }


    gamePlayActionCheck() {
        // determine if check is check allowed
        // set current player's last action to check
        // change the current player (whose turn is it to act)
        // restart timer

    }

    gamePlayActionBet() {

        // determine if bet is allowed
    }



    /*
        Player actions that all clear the timeout:
        Standing up, folding, checking, betting, raising, quitting.
    */



}