import { Service } from "typedi";
import { GameState, cleanGameState } from '../models/gameState';
import { StraddleType, GameType, GameParameters, BettingRoundStage, BettingRoundAction, BettingRoundActionType, CHECK_ACTION, FOLD_ACTION } from '../models/game';
import { NewGameForm, ConnectedClient } from '../models/table';
import { Player } from '../models/player';
import { PlayerService } from './playerService';
import { DeckService } from './deckService';
import { generateUUID } from '../util/util';


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
        const seats: [number, string][] = Object.values(this.gameState.players)
            .filter(player => player.seatNumber >= 0)
            .map((player) => [player.seatNumber, player.uuid]);
        seats.sort();
        return seats;
    }

    getDeck() {
        return this.gameState.deck;
    }

    getNextPlayerUUID(currentPlayerUUID: string) {
        const seats = this.getSeats();
        const currentIndex = seats.findIndex(
            ([seatNumber, uuid]) => uuid === currentPlayerUUID);

        // if input is empty string, then there hasn't been a dealer yet, pick index 0
        const nextIndex = currentPlayerUUID ? (currentIndex + 1) % seats.length : 0;
        const [_, nextPlayerUUID] = seats[nextIndex];
        return nextPlayerUUID;
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
    }


    /* Player operations */

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
    }

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
    }

    setNextPlayerToAct() {
        this.gameState = {
            ...this.gameState,
            currentPlayerToAct: this.getNextPlayerUUID(this.getCurrentPlayerToAct())
        }
    }

    setPlayerLastAction(playerUUID: string, lastAction: BettingRoundAction) {
        const player = {
            ...this.getPlayer(playerUUID),
            lastAction
        };
        const players = { ...this.gameState.players, [player.uuid]: player };
        this.gameState = {
            ...this.gameState,
            players,
        };
    }

    /* Gameplay functionality */

    // if game is started, and state is waiting, try to initializeGameRound
    // perform this check after every incoming message
    // this way, you don't have to check explicit events
    startGame() {
        // start the timer
        // set the game to in progress

        this.gameState = {
            ...this.gameState,
            gameInProgress: true,

        };
    }

    // TODO wipe gameplay game state.
    stopGame() {
        this.gameState = {
            ...this.gameState,
            gameInProgress: false,
        }
    }

    // executed after every message processed
    pollForGameContinuation() {
        if (!this.isGameInProgress()) {
            return;
        }
        if (this.getBettingRoundStage() === BettingRoundStage.WAITING) {
            this.startHand();
        }
    }

    initializeDealerButton() {
        const playerUUID = this.getNextPlayerUUID(this.gameState.dealerUUID);

        this.gameState = {
            ...this.gameState,
            dealerUUID: playerUUID
        };
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

        const sbPlayer = {
            ...this.getPlayer(smallBlindUUID),
            lastAction: {
                type: BettingRoundActionType.BET,
                amount: this.getSB(),
                allin: false
            }
        };
        const bbPlayer = {
            ...this.getPlayer(bigBlindUUID),
            lastAction: {
                type: BettingRoundActionType.BET,
                amount: this.getBB(),
                allin: false
            }
        };

        const firstToActPreflop = this.getNextPlayerUUID(bigBlindUUID);

        this.gameState = {
            ...this.gameState,
            // players: { ...this.gameState.players, [sbPlayer.uuid]: sbPlayer, [bbPlayer.uuid]: bbPlayer },
            currentPlayerToAct: firstToActPreflop
        };
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
        this.gameState = {
            ...this.gameState,
            deck,
            bettingRoundStage: BettingRoundStage.PREFLOP,
        };
        this.distributeHoleCards();
    }

    distributeHoleCards() {
        const deck = this.getDeck();
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
            players
        };
    }


    /* FLOP */

    dealFlop() {
        const deck = this.getDeck();
        this.gameState = {
            ...this.gameState,
            board: {
                cards: [
                    // TODO make this variant agnostic
                    this.deckService.drawCard(deck),
                    this.deckService.drawCard(deck),
                    this.deckService.drawCard(deck),
                ]
            },
            deck,
            bettingRoundStage: BettingRoundStage.FLOP,
        };
    }



    /* Betting Round Actions */

    performBettingRoundAction(action: BettingRoundAction) {
        switch (action.type) {
            case BettingRoundActionType.CHECK: {
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
        this.setPlayerLastAction(currentPlayerToAct, CHECK_ACTION);
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



}