import { Service } from 'typedi';
import WebSocket from 'ws';

import { strict as assert } from 'assert';
import { GameState, cleanGameState } from '../../../shared/models/gameState';
import {
    StraddleType,
    GameType,
    GameParameters,
    BETTING_ROUND_STAGES,
    BettingRoundStage,
    BettingRoundAction,
    BettingRoundActionType,
    CHECK_ACTION,
    FOLD_ACTION,
    WAITING_TO_ACT,
} from '../../../shared/models/game';
import { NewGameForm, ConnectedClient } from '../../../shared/models/table';
import { Player } from '../../../shared/models/player';
import { PlayerService } from './playerService';
import { DeckService } from './deckService';
import { generateUUID, printObj } from '../../../shared/util/util';
import { Subject } from 'rxjs';

@Service()
export class GameStateManager {
    private gameState: Readonly<GameState> = cleanGameState;
    private gameTimer: NodeJS.Timer;
    private updateEmitter: Subject<void> = new Subject<void>();

    constructor(private readonly deckService: DeckService, private readonly playerService: PlayerService) {}

    /* Getters */

    getGameState(): GameState {
        return this.gameState;
    }

    observeUpdates() {
        return this.updateEmitter.asObservable();
    }

    getConnectedClient(clientUUID: string) {
        return this.gameState.table.activeConnections.get(clientUUID);
    }

    getConnectedClients() {
        return this.gameState.table.activeConnections.values();
    }

    getPlayerByClientUUID(clientUUID: string): Player {
        const connectedClient = this.getConnectedClient(clientUUID);
        const playerUUID = connectedClient.playerUUID;
        return this.getPlayer(playerUUID);
    }

    getPlayer(playerUUID: string): Player {
        return this.gameState.players[playerUUID];
    }

    getPlayers(): Readonly<{ [key: string]: Player }> {
        return this.gameState.players;
    }

    getCurrentPlayerToAct() {
        return this.gameState.currentPlayerToAct;
    }

    getDealerUUID() {
        return this.gameState.dealerUUID;
    }

    getBoard() {
        return this.gameState.board;
    }

    getTotalPot() {
        return this.gameState.pots.reduce((sum, pot) => pot.value + sum, 0);
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
            .filter((player) => this.wasPlayerDealtIn(player.uuid))
            .map((player) => player.lastAction);
    }

    getBettingRoundStage() {
        return this.gameState.bettingRoundStage;
    }

    getNumberPlayersSitting() {
        return Object.entries(this.gameState.players).filter(([uuid, player]) => player.sitting).length;
    }

    getSeats() {
        const seats: [number, string][] = Object.values(this.gameState.players)
            .filter((player) => player.seatNumber >= 0)
            .map((player) => [player.seatNumber, player.uuid]);
        seats.sort();
        return seats;
    }

    getDeck() {
        return this.gameState.deck;
    }

    getPlayersInHand() {
        return Object.keys(this.gameState.players).filter((playerUUID) => this.isPlayerInHand(playerUUID));
    }

    isPlayerReadyToPlay(playerUUID: string) {
        return this.getPlayer(playerUUID).sitting;
    }

    isPlayerInHand(playerUUID: string) {
        return !this.hasPlayerFolded(playerUUID) && this.wasPlayerDealtIn(playerUUID);
    }

    hasPlayerFolded(playerUUID: string) {
        return this.getPlayer(playerUUID).lastAction.type === BettingRoundActionType.FOLD;
    }

    getNextPlayerReadyToPlayUUID(currentPlayerUUID: string) {
        const seats = this.getSeats();
        const currentIndex = seats.findIndex(([seatNumber, uuid]) => uuid === currentPlayerUUID);

        // find the next player that is in the hand
        let nextIndex = (currentIndex + 1) % seats.length;
        let [_, nextPlayerUUID] = seats[nextIndex];
        while (!this.isPlayerReadyToPlay(nextPlayerUUID)) {
            nextIndex = (nextIndex + 1) % seats.length;
            [_, nextPlayerUUID] = seats[nextIndex];
        }
        return nextPlayerUUID;
    }

    getNextPlayerInHandUUID(currentPlayerUUID: string) {
        const seats = this.getSeats();
        const currentIndex = seats.findIndex(([seatNumber, uuid]) => uuid === currentPlayerUUID);

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
        return Object.entries(this.gameState.players).some(([uuid, player]) => player.seatNumber === seatNumber);
    }

    isValidSeat(seatNumber: number) {
        return seatNumber >= 0 && seatNumber < this.gameState.gameParameters.maxPlayers;
    }

    isGameInProgress() {
        return this.gameState.gameInProgress;
    }

    /* Initialization methods */

    // TODO validation around this method. Shouldn't be executed when table is not intialized.
    initConnectedClient(clientUUID: string, ws: WebSocket) {
        const client = this.gameState.table.activeConnections.get(clientUUID);
        if (!client) {
            const newClient = this.playerService.createConnectedClient(clientUUID, ws);
            this.gameState = {
                ...this.gameState,
                table: {
                    ...this.gameState.table,
                    activeConnections: new Map([...this.gameState.table.activeConnections, [clientUUID, newClient]]),
                },
            };
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
            },
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

    /* Updaters */

    updateGameParameters(gameParameters: GameParameters) {
        this.gameState = {
            ...this.gameState,
            gameParameters: {
                ...gameParameters,
            },
        };
    }

    /* Player operations */

    associateClientAndPlayer(clientUUID: string, player: Player): ConnectedClient {
        const connectedClient = this.getConnectedClient(clientUUID);
        return {
            ...connectedClient,
            playerUUID: player.uuid,
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
                    [associatedClient.uuid, associatedClient],
                ]),
            },
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
            seatNumber: -1,
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
            currentPlayerToAct: playerUUID,
        };
    }

    setNextPlayerToAct() {
        this.setCurrentPlayerToAct(this.getNextPlayerInHandUUID(this.getCurrentPlayerToAct()));
    }

    setPlayerLastAction(playerUUID: string, lastAction: BettingRoundAction) {
        const player = {
            ...this.getPlayer(playerUUID),
            lastAction,
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
        };
    }

    // are there only two actions after which a round can start?
    // after sit down and after start game?
    // regardless, better to not tie start game condition check
    // to be dependent on those actions
    startHandIfReady() {
        if (
            // this.isGameInProgress() &&
            this.getBettingRoundStage() === BettingRoundStage.WAITING &&
            this.getNumberPlayersSitting() >= 2
        ) {
            this.clearStateOfRoundInfo();
            this.initializeBettingRound();
        }
    }

    clearStateOfRoundInfo() {
        this.gameState = {
            ...this.gameState,
            players: Object.fromEntries(
                Object.entries(this.gameState.players).map(([uuid, player]) => [
                    uuid,
                    { ...player, lastAction: null, holeCards: [], winner: false },
                ]),
            ),
            board: [],
            bettingRoundStage: BettingRoundStage.WAITING,
            currentPlayerToAct: '',
            pots: [],
            gameInProgress: true,
            deck: {
                cards: [],
            },
        };
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
        const dealerUUID = this.gameState.dealerUUID
            ? this.getNextPlayerReadyToPlayUUID(this.gameState.dealerUUID)
            : seatZeroPlayerUUID;

        this.gameState = {
            ...this.gameState,
            dealerUUID,
        };
    }

    /*
        TODO ensure that the players have enough to cover the blinds, and if not, put them
        all-in. Don't let a player get this point if they have zero chips, stand them up earlier.
        TODO substract chips from the players
    */
    placeBlinds() {
        const smallBlindUUID = this.getNextPlayerReadyToPlayUUID(this.gameState.dealerUUID);
        const bigBlindUUID = this.getNextPlayerReadyToPlayUUID(smallBlindUUID);

        const sbPlayer = {
            ...this.getPlayer(smallBlindUUID),
            lastAction: {
                type: BettingRoundActionType.BET,
                amount: this.getSB(),
                allin: false,
            },
        };
        const bbPlayer = {
            ...this.getPlayer(bigBlindUUID),
            lastAction: {
                type: BettingRoundActionType.BET,
                amount: this.getBB(),
                allin: false,
            },
        };

        // If heads up, dealer is first to act
        const firstToActPreflop =
            this.getPlayersReadyToPlay().length === 2
                ? this.gameState.dealerUUID
                : this.getNextPlayerReadyToPlayUUID(bigBlindUUID);

        this.gameState = {
            ...this.gameState,
            // TODO uncomment this line to actually put blinds in
            // players: { ...this.gameState.players, [sbPlayer.uuid]: sbPlayer, [bbPlayer.uuid]: bbPlayer },
            currentPlayerToAct: firstToActPreflop,
        };
    }

    distributeHoleCards() {
        const deck = this.getDeck();
        const players = Object.fromEntries(
            Object.entries(this.gameState.players).map(([uuid, player]) => [
                uuid,
                player.sitting
                    ? {
                          ...player,
                          holeCards: [this.deckService.drawCard(deck), this.deckService.drawCard(deck)],
                      }
                    : player,
            ]),
        );
        this.gameState = {
            ...this.gameState,
            players,
        };
    }

    /* STREETS */
    dealCardsToBoard(amount: number) {
        const newCards = [...Array(amount).keys()].map((_) => this.deckService.drawCard(this.getDeck()));
        this.gameState = {
            ...this.gameState,
            board: [...this.gameState.board, ...newCards],
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
        const board = this.getBoard();
        const playersHands = Object.fromEntries(
            this.getPlayersInHand().map((playerUUID) => [
                playerUUID,
                this.deckService.computeBestHandFromCards([...this.getPlayer(playerUUID).holeCards, ...board]),
            ]),
        );

        const winningHands = this.deckService.getWinningHands(Object.values(playersHands));

        const winningPlayers = Object.entries(playersHands)
            .filter(([uuid, hand]) => winningHands.includes(hand))
            .map(([uuid, hand]) => uuid);

        this.gameState = {
            ...this.gameState,
            players: Object.fromEntries(
                Object.entries(this.getPlayers()).map(([uuid, player]) => [
                    uuid,
                    { ...player, winner: winningPlayers.includes(uuid) },
                ]),
            ),
        };
    }

    finishHand() {
        console.log('\nfinishHand\n');
        this.gameTimer = global.setTimeout(this.globalTimerFn.bind(this, this.clearBettingRoundStage), 2000);
    }

    globalTimerFn(fn: () => any) {
        console.log('globalTimerFn\n');

        // fn();
        this.clearBettingRoundStage();
        this.startHandIfReady();
        this.updateEmitter.next();
    }

    initializeBettingRound() {
        // TODO timer - this seems like it would a good place to handle the timer

        const stage = this.getBettingRoundStage();

        // this is incorrect - if someone has folded, this unfolds them.
        this.gameState = {
            ...this.gameState,
            players: Object.fromEntries(
                Object.entries(this.gameState.players).map(([uuid, player]) => [
                    uuid,
                    player.sitting ? { ...player, lastAction: WAITING_TO_ACT } : player,
                ]),
            ),
        };

        switch (stage) {
            case BettingRoundStage.WAITING: {
                this.nextBettingRound();
                /* intentional switch-fallthrough */
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
                this.finishHand();
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

            case BettingRoundActionType.FOLD: {
                this.fold();
                break;
            }

            case BettingRoundActionType.BET: {
                this.bet(action);
                break;
            }

            case BettingRoundActionType.CALL: {
                this.callBet(action);
            }
        }

        // this logic could probably be placed in its own method
        // do that later once you figure out a good name for it
        // also dont overdo it with the functions rofl
        if (this.haveAllPlayersActed()) {
            this.finishBettingRound();

            if (!this.currentHandHasResult()) {
                this.nextBettingRound();
                this.initializeBettingRound();
            }
        } else {
            this.setNextPlayerToAct();
        }
    }

    // if the validation layer takes care of most things,
    // then its possible to get rid of these methods, and of
    // the CHECK_ACTION / FOLD_ACTION constants
    check() {
        const currentPlayerToAct = this.getCurrentPlayerToAct();
        this.setPlayerLastAction(currentPlayerToAct, CHECK_ACTION);
    }

    fold() {
        const currentPlayerToAct = this.getCurrentPlayerToAct();
        this.setPlayerLastAction(currentPlayerToAct, FOLD_ACTION);
    }

    bet(action: BettingRoundAction) {
        const currentPlayerToAct = this.getCurrentPlayerToAct();
        console.log('setting Player last action to action:', action);
        this.setPlayerLastAction(currentPlayerToAct, action);
    }

    callBet(action: BettingRoundAction) {
        const currentPlayerToAct = this.getCurrentPlayerToAct();
        this.setPlayerLastAction(currentPlayerToAct, action);
    }

    /** Includes all players that were dealt in pre-flop. */
    getPlayersDealtIn() {
        return Object.values(this.gameState.players).filter((player) => this.wasPlayerDealtIn(player.uuid));
    }

    getPlayersReadyToPlay() {
        return Object.values(this.gameState.players).filter((player) => this.isPlayerReadyToPlay(player.uuid));
    }

    wasPlayerDealtIn(playerUUID: string) {
        return this.gameState.players[playerUUID].holeCards.length > 0;
    }

    getHighestBet() {
        const playersInHand = this.getPlayersDealtIn();
        assert(playersInHand.length > 0, 'playersInHand.length was <= 0');

        return playersInHand.reduce((max, player) => {
            return player.lastAction.amount > max ? player.lastAction.amount : max;
        }, 0);
    }

    // TODO implement
    isPlayerAllIn(playerUUID: string) {
        const player = this.getPlayer(playerUUID);
    }

    haveAllPlayersActed() {
        return this.getPlayersDealtIn().every(
            (player) =>
                player.lastAction.type !== BettingRoundActionType.WAITING_TO_ACT &&
                (this.hasPlayerFolded(player.uuid) ||
                    player.lastAction.amount === this.getHighestBet() ||
                    this.isPlayerAllIn(player.uuid)),
        );
    }

    currentHandHasResult() {
        return false;
    }

    placeBetsInPot() {
        this.gameState = {
            ...this.gameState,
            pots: [
                ...this.gameState.pots,
                {
                    value: Object.values(this.gameState.players).reduce(
                        (sum, player) => (player.lastAction ? player.lastAction.amount + sum : 0),
                        0,
                    ),
                    contestors: [...this.getPlayersInHand()],
                },
            ],
        };
    }

    checkForVictoryCondition() {
        // check for victory condition:
        // either everyone folded but one person,
        // or this is the river and its time for showdown
        // if someone wins, add the hand result to the gameState (UI shows victory)
    }

    clearActionsForPlayersInHand() {
        // TODO DRY w.r.t logic in initializeBettingRound
        // TODO DRY w.r.t setting a property for a group of players
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
        assert(bettingRoundStage !== BettingRoundStage.SHOWDOWN, 'This method shouldnt be called after showdown.');
        return BETTING_ROUND_STAGES[BETTING_ROUND_STAGES.indexOf(bettingRoundStage) + 1];
    }

    nextBettingRound() {
        const nextStage = this.getNextBettingRoundStage();
        this.gameState = {
            ...this.gameState,
            bettingRoundStage: nextStage,
        };
    }

    clearBettingRoundStage() {
        this.gameState = {
            ...this.gameState,
            bettingRoundStage: BettingRoundStage.WAITING,
        };
    }
}
