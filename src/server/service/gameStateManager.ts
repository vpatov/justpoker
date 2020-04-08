import { Service } from 'typedi';
import { strict as assert } from 'assert';
import { GameState, cleanGameState } from '../models/gameState';
import { StraddleType, GameType, GameParameters, BETTING_ROUND_STAGES, BettingRoundStage, BettingRoundAction, BettingRoundActionType, CHECK_ACTION, FOLD_ACTION, WAITING_TO_ACT } from '../models/game';
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

    getDealerUUID() {
        return this.gameState.dealerUUID;
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
            .filter(player => this.wasPlayerDealtIn(player.uuid))
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

    isPlayerInHand(playerUUID: string) {
        return !this.hasPlayerFolded(playerUUID) && this.wasPlayerDealtIn(playerUUID);
    }

    hasPlayerFolded(playerUUID: string) {
        return this.getPlayer(playerUUID).lastAction.type === BettingRoundActionType.FOLD;
    }

    getNextPlayerInHandUUID(currentPlayerUUID: string) {
        const seats = this.getSeats();
        const currentIndex = seats.findIndex(
            ([seatNumber, uuid]) => uuid === currentPlayerUUID);

        // find the next player that is in the hand
        let nextIndex = (currentIndex + 1) % seats.length;
        let [_, nextPlayerUUID] = seats[nextIndex];
        while (!this.isPlayerInHand(nextPlayerUUID)) {
            nextIndex = (nextIndex + 1) % seats.length;
            [_, nextPlayerUUID] = seats[nextIndex];
        }
        return nextPlayerUUID;
    }

    isSeatTaken(seatNumber: number) {
        return Object.entries(this.gameState.players)
            .some(([uuid, player]) => player.seatNumber === seatNumber);
    }

    isValidSeat(seatNumber: number) {
        return seatNumber >= 0 && seatNumber < this.gameState.gameParameters.maxPlayers;
    }

    isGameInProgress() {
        return this.gameState.gameInProgress;
    }


    /* Initialization methods */

    // TODO validation around this method. Shouldn't be executed when table is not intialized.
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
                    player :
                    { ...player, holeCards: [] })
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

    setCurrentPlayerToAct(playerUUID: string) {
        this.gameState = {
            ...this.gameState,
            currentPlayerToAct: playerUUID
        };
    }

    setNextPlayerToAct() {
        this.setCurrentPlayerToAct(
            this.getNextPlayerInHandUUID(this.getCurrentPlayerToAct()));
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

    // are there only two actions after which a round can start?
    // after sit down and after start game?
    // regardless, better to not tie start game condition check
    // to be dependent on those actions
    startHandIfReady() {
        if (this.getBettingRoundStage() === BettingRoundStage.WAITING
            && this.getNumberPlayersSitting() >= 2) {
            this.initializeBettingRound();
        }
    }


    initializePreflop() {
        // TODO this is where you would start the timer
        this.initializeDealerButton();
        this.placeBlinds();

        const deck = this.deckService.newDeck();
        this.gameState = {
            ...this.gameState,
            deck,
            bettingRoundStage: BettingRoundStage.PREFLOP,
        };
        this.distributeHoleCards();
    }

    initializeDealerButton() {
        const seats = this.getSeats();
        const [_, seatZeroPlayerUUID] = seats[0];
        const dealerUUID = this.gameState.dealerUUID ?
            this.getNextPlayerInHandUUID(this.gameState.dealerUUID) :
            seatZeroPlayerUUID;

        this.gameState = {
            ...this.gameState,
            dealerUUID
        };
    }

    /*
        TODO ensure that the players have enough to cover the blinds, and if not, put them
        all-in. Don't let a player get this point if they have zero chips, stand them up earlier.
        TODO substract chips from the players
        TODO place blinds correctly when there are only two people
    */
    placeBlinds() {
        const smallBlindUUID = this.getNextPlayerInHandUUID(this.gameState.dealerUUID);
        const bigBlindUUID = this.getNextPlayerInHandUUID(smallBlindUUID);

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

        // If heads up, dealer is first to act
        const firstToActPreflop = this.getPlayersDealtIn().length === 2 ?
            this.gameState.dealerUUID :
            this.getNextPlayerInHandUUID(bigBlindUUID);


        this.gameState = {
            ...this.gameState,
            // TODO uncomment this line to actually put blinds in
            // players: { ...this.gameState.players, [sbPlayer.uuid]: sbPlayer, [bbPlayer.uuid]: bbPlayer },
            currentPlayerToAct: firstToActPreflop
        };
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

    /* STREETS */
    dealCardsToBoard(amount: number) {
        const newCards = [...Array(amount).keys()]
            .map(_ => this.deckService.drawCard(this.getDeck()));
        this.gameState = {
            ...this.gameState,
            board: {
                cards: [
                    ...this.gameState.board.cards,
                    ...newCards
                ]
            }
        };
    }

    initializeFlop() {
        assert(this.getBettingRoundStage() === BettingRoundStage.FLOP);
        this.setCurrentPlayerToAct(this.getNextPlayerInHandUUID(this.getDealerUUID()));
        this.dealCardsToBoard(3);
    }

    initializeTurn() {
        assert(this.getBettingRoundStage() === BettingRoundStage.TURN);
        this.setCurrentPlayerToAct(this.getNextPlayerInHandUUID(this.getDealerUUID()));
        this.dealCardsToBoard(1);
    }

    initializeRiver() {
        assert(this.getBettingRoundStage() === BettingRoundStage.RIVER);
        this.setCurrentPlayerToAct(this.getNextPlayerInHandUUID(this.getDealerUUID()));
        this.dealCardsToBoard(1);
    }

    showDown() {
        // TODO integrate poker solver and compute winner


    }

    initializeBettingRound() {
        // TODO timer - this seems like it would a good place to handle the timer


        // players are gonna be "waiting to act" at the beginning of flop, turn, river, showDown
        // but not preflop
        const players = Object.fromEntries(Object.entries(this.gameState.players).map(
            ([uuid, player]) => [
                uuid,
                (player.sitting ? { ...player, lastAction: WAITING_TO_ACT } : player)
            ]
        ));

        this.gameState = {
            ...this.gameState,
            players
        };

        switch (this.getBettingRoundStage()) {
            case BettingRoundStage.WAITING: {
                this.nextBettingRound();

                // having this recursive call is not an optimal design
                // you're also executing the code at the top of this function twice
                this.initializeBettingRound();
                break;
            }
            case BettingRoundStage.PREFLOP: {
                this.initializePreflop();
                break;
            }
            case BettingRoundStage.FLOP: {
                this.initializeFlop();
                break;
            }
            case BettingRoundStage.TURN: {
                this.initializeTurn();
                break;
            }
            case BettingRoundStage.RIVER: {
                this.initializeRiver();
                break;
            }
            case BettingRoundStage.SHOWDOWN: {
                this.showDown();
                break;
            }
        }
    }

    /* Betting Round Actions */

    performBettingRoundAction(action: BettingRoundAction) {
        switch (action.type) {
            case BettingRoundActionType.CHECK: {
                this.check();
                break;
            }
        }
        debugger;

        // this logic could probably be placed in its own method
        // do that later once you figure out a good name for it
        // also dont overdo it with the functions rofl
        if (this.haveAllPlayersActed()) {
            this.finishBettingRound();

            if (!this.currentHandHasResult()) {
                this.nextBettingRound();
                this.initializeBettingRound();
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

    /** Includes all players that were dealt in pre-flop. */
    getPlayersDealtIn() {
        return Object.values(this.gameState.players)
            .filter(player => this.wasPlayerDealtIn(player.uuid));
    }

    wasPlayerDealtIn(playerUUID: string) {
        return !!this.gameState.players[playerUUID].lastAction;
    }


    getHighestBet() {
        const playersInHand = this.getPlayersDealtIn();
        assert(playersInHand.length > 0, "playersInHand.length was <= 0");

        return playersInHand.reduce((max, player) => {
            return player.lastAction.amount > max ?
                player.lastAction.amount :
                max;
        }, 0);
    }



    haveAllPlayersActed() {
        return this.getPlayersDealtIn()
            .every(player =>
                player.lastAction.type !== BettingRoundActionType.WAITING_TO_ACT &&
                (
                    this.hasPlayerFolded(player.uuid) ||
                    player.lastAction.amount === this.getHighestBet() ||
                    player.lastAction.allin
                )
            );
    }


    currentHandHasResult() {
        return false;
    }

    placeBetsInPot() {

    }

    checkForVictoryCondition() {
        // check for victory condition:
        // either everyone folded but one person,
        // or this is the river and its time for showdown
        // if someone wins, add the hand result to the gameState (UI shows victory)
    }

    clearActionsForPlayersInHand() {
        // TODO DRY w.r.t logic in initializeBettingRound

    }

    clearCurrentPlayerToAct() {
        this.gameState = {
            ...this.gameState,
            currentPlayerToAct: '',
        };
    }

    finishBettingRound() {
        this.placeBetsInPot();
        this.checkForVictoryCondition();
        this.clearActionsForPlayersInHand();
        this.clearCurrentPlayerToAct();
    }

    getNextBettingRoundStage() {
        const bettingRoundStage = this.gameState.bettingRoundStage;
        assert(bettingRoundStage !== BettingRoundStage.SHOWDOWN,
            "This method shouldnt be called after showdown.");
        return BETTING_ROUND_STAGES[
            BETTING_ROUND_STAGES.indexOf(bettingRoundStage) + 1];

    }

    nextBettingRound() {
        const nextStage = this.getNextBettingRoundStage();
        this.gameState = {
            ...this.gameState,
            bettingRoundStage: nextStage,
        };
    }



}