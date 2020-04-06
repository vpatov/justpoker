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
    gameTimer: NodeJS.Timer;

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

    stripSensitiveFields(cookie: string) {
        const connectedClient = this.getConnectedClient(cookie);
        const clientPlayerUUID = connectedClient.playerUUID;

        const players = Object.fromEntries(Object.entries(this.gameState.players).map(
            ([uuid, player]) => [
                uuid,
                (uuid === clientPlayerUUID ?
                    this.gameState.players[uuid] :
                    { ...this.gameState.players[uuid], holeCards: [] })
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
        return client;
    }

    createConnectedClient(clientUUID: string): ConnectedClient {
        return {
            uuid: clientUUID,
            playerUUID: ''
        };
    }

    getPlayerByClientUUID(cookie: string): Player {
        const connectedClient = this.getConnectedClient(cookie);
        const playerUUID = connectedClient.playerUUID;
        return this.getPlayer(playerUUID);
    }

    getPlayer(playerUUID: string) {
        const player = this.gameState.players[playerUUID];

        return player;
    }

    associateClientAndPlayer(cookie: string, player: Player) {
        const connectedClient = this.getConnectedClient(cookie);
        if (connectedClient.playerUUID) {
            throw Error("The client already has a player association.");
        }
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


    isSeatTaken(seatNumber: number) {
        return Object.entries(this.gameState.players).some(([uuid, player]) => {
            player.seatNumber === seatNumber
        });
    }

    isValidSeat(seatNumber: number) {
        return seatNumber >= 0 && seatNumber < this.gameState.gameParameters.maxPlayers;
    }

    // dealer is position X, SB X+1, BB X+2 (wrap around)
    sitDownPlayer(playerUUID: string, seatNumber: number) {
        const player = {
            ...this.gameState.players[playerUUID],
            sitting: true,
            seatNumber,
        };
        const players = { ...this.gameState.players, [player.uuid]: player };
        const seats: [number, string][] = Object.values(players).map(
            (player) => [player.seatNumber, player.uuid]
        );
        seats.sort();

        this.gameState = {
            ...this.gameState,
            players,
            seats,
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
        if (!this.gameState.gameInProgress) {
            throw Error(`Game must be in progress to initialize preflop`);
        }
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

    isCheckAllowed() {

    }


    /*
        Player actions that all clear the timeout:
        Standing up, folding, checking, betting, raising, quitting.
    */



}