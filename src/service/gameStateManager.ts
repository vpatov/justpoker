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
        const strippedGameState = {
            ...this.gameState,
            players: Object.keys(this.gameState.players).map(
                (uuid) => (uuid === clientPlayerUUID ?
                    this.gameState.players[uuid] :
                    { ...this.gameState.players[uuid], holeCards: [] })
            ),
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
        if (!client) {
            throw Error(`Client ${cookie} does not exist.`);
        }
        return client;
    }

    createConnectedClient(cookie: string): ConnectedClient {
        return {
            cookie,
            playerUUID: ''
        };
    }

    getPlayer(cookie: string): Player {
        console.log("\n getPlayer \n");
        const connectedClient = this.getConnectedClient(cookie);
        const playerUUID = connectedClient.playerUUID;
        const player = this.gameState.players[playerUUID];
        if (!player) {
            throw Error(`Player ${playerUUID} does not exist. Fatal error.`);
        }
        return player;
    }

    associateClientAndPlayer(cookie: string, player: Player) {
        console.log("\n associateClientAndPlayer \n");
        const connectedClient = this.getConnectedClient(cookie);
        if (connectedClient.playerUUID) {
            throw Error("The client already has a player association.");
        }
        return {
            ...connectedClient,
            playerUUID: player.uuid
        };
    }

    addNewPlayerToGame(cookie: string, name: string, buyin: number) {
        console.log("\n addNewPlayerToGame \n");
        const player = this.playerService.createNewPlayer(name, buyin);
        const associatedClient = this.associateClientAndPlayer(cookie, player);
        this.gameState = {
            ...this.gameState,
            players: { ...this.gameState.players, [player.uuid]: player },
            table: {
                ...this.gameState.table,
                activeConnections: new Map([
                    ...this.gameState.table.activeConnections,
                    [associatedClient.cookie, associatedClient]
                ])
            }
        };
        console.log(this.gameState);
        console.log(this.gameState.table);
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

    // dealer is position X, SB X+1, BB X+2 (wrap around)
    sitDownPlayer(cookie: string, seatNumber: number) {
        console.log("\n sitDownPlayer \n");
        const client = this.getConnectedClient(cookie);
        const player = {
            ...this.gameState.players[client.playerUUID],
            sitting: true,
            seatNumber,

        };
        this.gameState = {
            ...this.gameState,
            players: { ...this.gameState.players, [player.uuid]: player }
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
            gameInProgress: true
        };

        this.startGameTimer();
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
    startGameTimer() {
        console.log("\n startGameTimer \n");

    }

}