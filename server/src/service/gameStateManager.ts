import { Service } from 'typedi';
import WebSocket from 'ws';

import { strict as assert } from 'assert';
import {
    GameState,
    cleanGameState,
    ServerStateKey,
    GameStage,
    ALL_STATE_KEYS,
    Pot,
} from '../../../ui/src/shared/models/gameState';
import {
    StraddleType,
    GameType,
    GameParameters,
    BETTING_ROUND_STAGES,
    BettingRoundStage,
    BettingRoundAction,
    BettingRoundActionType,
} from '../../../ui/src/shared/models/game';
import { NewGameForm, ConnectedClient } from '../../../ui/src/shared/models/table';
import { Player, cleanPlayer } from '../../../ui/src/shared/models/player';
import { DeckService } from './deckService';
import { generateUUID, printObj } from '../../../ui/src/shared/util/util';
import { ActionType, JoinTableRequest } from '../../../ui/src/shared/models/wsaction';
import { HandSolverService } from './handSolverService';
import { TimerManager } from './timerManager';

// TODO Re-organize methods in some meaningful way

@Service()
export class GameStateManager {
    private gameState: Readonly<GameState> = cleanGameState;

    // TODO place updatedKey logic into a seperate ServerStateManager file.
    updatedKeys: Set<ServerStateKey> = ALL_STATE_KEYS;

    getUpdatedKeys(): Set<ServerStateKey> {
        return this.updatedKeys;
    }

    addUpdatedKeys(...updatedKeys: ServerStateKey[]) {
        updatedKeys.forEach((updatedKey) => this.updatedKeys.add(updatedKey));
    }

    setUpdatedKeys(updatedKeys: Set<ServerStateKey>) {
        this.updatedKeys = new Set(updatedKeys);
    }

    constructor(
        private readonly deckService: DeckService,
        private readonly handSolverService: HandSolverService,
        private readonly timerManager: TimerManager,
    ) {}

    /* Getters */

    getGameState(): GameState {
        return this.gameState;
    }

    getGameStage(): GameStage {
        return this.gameState.gameStage;
    }

    updateGameStage(gameStage: GameStage) {
        this.updateGameState({ gameStage });
    }

    updateGameState(updates: Partial<GameState>) {
        this.gameState = {
            ...this.gameState,
            ...updates,
        };
    }

    snapShotGameState() {
        return {
            ...this.gameState,
        };
    }

    createNewPlayer(name: string, chips: number): Player {
        return {
            ...cleanPlayer,
            uuid: generateUUID(),
            name,
            chips,
        };
    }

    createConnectedClient(clientUUID: string, ws: WebSocket): ConnectedClient {
        return {
            uuid: clientUUID,
            playerUUID: '',
            ws,
        };
    }

    resetSingltonState() {
        this.updateGameState({
            unsetQueuedAction: false,
        });
    }

    updatePlayer(playerUUID: string, updates: Partial<Player>) {
        const player = this.getPlayer(playerUUID);

        this.updateGameState({
            players: {
                ...this.gameState.players,
                [player.uuid]: { ...player, ...updates },
            },
        });
    }
    updatePlayers(updateFn: (player: Player) => Partial<Player>) {
        Object.entries(this.gameState.players).forEach(([uuid, player]) => this.updatePlayer(uuid, updateFn(player)));
    }

    getConnectedClient(clientUUID: string) {
        return this.gameState.table.activeConnections.get(clientUUID);
    }

    getClientByPlayerUUID(playerUUID: string): string {
        if (!playerUUID) {
            throw Error(`getClientByPlayerUUID called with null playerUUID`);
        }
        const clients = [];
        for (const client of this.getConnectedClients()) {
            if (client.playerUUID === playerUUID) {
                clients.push(client);
            }
        }

        if (clients.length !== 1) {
            console.log(
                `clients.length was ${clients.length} and not 1. ` +
                    `clients: ${JSON.stringify(clients)}, playerUUID: ${playerUUID}, allClients: ${JSON.stringify(
                        this.getConnectedClients(),
                    )}`,
            );
        }
        return clients[0].uuid;
    }

    getUnsetQueuedAction(): boolean {
        return this.gameState.unsetQueuedAction;
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

    getPreviousRaise() {
        return this.gameState.previousRaise;
    }

    getPartialAllInLeftOver() {
        return this.gameState.partialAllInLeftOver;
    }

    getMinRaiseDiff() {
        return this.gameState.minRaiseDiff;
    }

    getCurrentPlayerToAct() {
        return this.gameState.currentPlayerToAct;
    }

    getDealerUUID() {
        return this.gameState.dealerUUID;
    }

    getBigBlindUUID() {
        return this.gameState.bigBlindUUID;
    }

    getSmallBlindUUID() {
        return this.gameState.smallBlindUUID;
    }

    getBoard() {
        return this.gameState.board;
    }

    addPlayerChips(playerUUID: string, addChips: number) {
        this.updatePlayer(playerUUID, { chips: this.getChips(playerUUID) + addChips });
    }

    setPlayerChips(playerUUID: string, setChips: number) {
        this.updatePlayer(playerUUID, { chips: setChips });
    }

    // returns time in milliseconds
    getTimeCurrentPlayerTurnStarted() {
        return this.gameState.timeCurrentPlayerTurnStarted;
    }

    // returns time in milliseconds
    getCurrentPlayerTurnElapsedTime() {
        return Date.now() - this.getTimeCurrentPlayerTurnStarted();
    }

    getTimeToAct() {
        return this.gameState.gameParameters.timeToAct;
    }

    getPots() {
        return this.gameState.pots;
    }

    popPot(): Pot {
        const potsLength = this.gameState.pots.length;
        assert(potsLength > 0, 'Cannot call popPot when length of pot array is zero. This is a bug.');
        const poppedPot = this.gameState.pots[0];
        this.updateGameState({ pots: this.gameState.pots.filter((pot) => pot != poppedPot) });
        assert(
            this.gameState.pots.length === potsLength - 1,
            'Pot array should have pot removed after calling popPot. This is a bug.',
        );
        return poppedPot;
    }

    getTotalPot() {
        return this.gameState.pots.reduce((sum, pot) => pot.value + sum, 0);
    }

    getAllCommitedBets() {
        return Object.values(this.getPlayers()).reduce((sum, player) => player.betAmount + sum, 0);
    }

    // pots plus all commited bets
    getFullPot() {
        return this.getTotalPot() + this.getAllCommitedBets();
    }

    getSB() {
        return this.gameState.gameParameters.smallBlind;
    }

    getBB() {
        return this.gameState.gameParameters.bigBlind;
    }

    getBettingRoundActionTypes() {
        return Object.values(this.gameState.players)
            .filter((player) => this.wasPlayerDealtIn(player.uuid))
            .map((player) => player.lastActionType);
    }

    getBettingRoundStage() {
        return this.gameState.bettingRoundStage;
    }

    getNumberPlayersSitting() {
        return Object.entries(this.gameState.players).filter(([uuid, player]) => player.sitting).length;
    }

    getNumberPlayersSittingIn() {
        return Object.entries(this.gameState.players).filter(([uuid, player]) => player.sitting && !player.sittingOut)
            .length;
    }

    getSeats() {
        const seats: [number, string][] = Object.values(this.gameState.players)
            .filter((player) => player.seatNumber >= 0)
            .map((player) => [player.seatNumber, player.uuid]);
        seats.sort();
        return seats;
    }

    getPositionRelativeToDealer(playerUUID: string) {
        const numPlayers = this.getPlayersDealtIn().length;
        return (
            this.getPlayer(playerUUID).seatNumber +
            ((numPlayers - this.getPlayer(this.getDealerUUID()).seatNumber) % numPlayers)
        );
    }

    comparePositions(playerA: string, playerB: string) {
        const posA = this.getPositionRelativeToDealer(playerA);
        const posB = this.getPositionRelativeToDealer(playerB);

        assert(
            playerA !== playerB,
            'gameStateManager.comparePositions was invoked with the same player. This is most likely a bug.',
        );
        assert(
            posA !== posB,
            'gameStateManager.getPositionRelativeToDealer returned the same position for two different players',
        );
        // they cannot be equal
        return posA < posB ? -1 : 1;
    }

    getDeck() {
        return this.gameState.deck;
    }

    getPlayersInHand(): string[] {
        return Object.keys(this.gameState.players).filter((playerUUID) => this.isPlayerInHand(playerUUID));
    }

    getPlayersEligibleToActNext(): string[] {
        return Object.keys(this.gameState.players).filter((playerUUID) => this.isPlayerEligibleToActNext(playerUUID));
    }

    canCurrentPlayerAct() {
        return this.gameState.currentPlayerToAct && this.gameState.gameStage === GameStage.WAITING_FOR_BET_ACTION;
    }

    getMinimumBetSize() {
        const minimumBet = this.getMinRaiseDiff() + this.getPreviousRaise() + this.getPartialAllInLeftOver();
        return minimumBet;
    }

    getMinimumBetSizeForPlayer(playerUUID: string) {
        const player = this.getPlayer(playerUUID);
        const minimumBetSize = this.getMinimumBetSize();
        return minimumBetSize > player.chips ? player.chips : minimumBetSize;
    }

    isGameStarted() {
        return this.gameState.shouldDealNextHand;
    }

    isPlayerInGame(playerUUID: string): boolean {
        return !!this.getPlayer(playerUUID);
    }

    isPlayerReadyToPlay(playerUUID: string): boolean {
        return this.getPlayer(playerUUID).sitting && !this.getPlayer(playerUUID).sittingOut;
    }

    isPlayerInHand(playerUUID: string): boolean {
        return !this.hasPlayerFolded(playerUUID) && this.wasPlayerDealtIn(playerUUID);
    }

    isPlayerFacingBet(playerUUID: string): boolean {
        return this.getPreviousRaise() + this.getPartialAllInLeftOver() > this.getPlayerBetAmount(playerUUID);
    }

    // TODO
    isPlayerFacingRaise(playerUUID: string): boolean {
        return false;
    }

    isPlayerEligibleToActNext(playerUUID: string): boolean {
        return (
            !this.hasPlayerFolded(playerUUID) && this.wasPlayerDealtIn(playerUUID) && !this.isPlayerAllIn(playerUUID)
        );
    }

    // incorrectly returning true if someone goes all in preflop and big blind doesnt have chance to fold/call
    isBettingRoundOver(): boolean {
        return this.haveAllPlayersActed();
    }

    hasPlayerFolded(playerUUID: string): boolean {
        return this.getPlayer(playerUUID).lastActionType === BettingRoundActionType.FOLD;
    }

    hasEveryoneButOnePlayerFolded(): boolean {
        return this.getPlayersInHand().length === 1;
    }

    // TODO put into validationService
    canPlayerStartGame(playerUUID: string) {
        const player = this.getPlayer(playerUUID);
        if (player.sitting && this.getPlayersReadyToPlay().length >= 2 && !this.isGameStarted()) return true;
        return false;
    }

    getPlayerStraddle(playerUUID: string): boolean {
        const player = this.getPlayer(playerUUID);
        return player.straddle;
    }

    getNextPlayerReadyToPlayUUID(currentPlayerUUID: string) {
        //TODO is this method ever called while nobody is sitting?
        // in a single-threaded env, probably

        const seats = this.getSeats();
        const currentIndex = seats.findIndex(([seatNumber, uuid]) => uuid === currentPlayerUUID);

        // find the next player that is in the hand
        let nextIndex = (currentIndex + 1) % seats.length;
        let [_, nextPlayerUUID] = seats[nextIndex];
        let counted = 0;

        while (!this.isPlayerReadyToPlay(nextPlayerUUID) && counted < seats.length) {
            nextIndex = (nextIndex + 1) % seats.length;
            [_, nextPlayerUUID] = seats[nextIndex];
            counted += 1;
        }
        if (counted == seats.length) {
            // TODO remove safeguard - only here to identify bugs
            throw Error(`Went through all players and didnt find the next player ready to play.`);
        }
        return nextPlayerUUID;
    }

    getNextPlayerInHandUUID(currentPlayerUUID: string) {
        //TODO duplicate safeguard.
        if (this.haveAllPlayersActed()) {
            throw Error('getNextPlayerInHandUUID shouldnt be called if all palyers have acted.');
        }
        if (!currentPlayerUUID) {
            throw Error('getNextPlayerInHandUUID shouldnt be called without a currentPalyerUUID');
        }
        const seats = this.getSeats();
        const currentIndex = seats.findIndex(([seatNumber, uuid]) => uuid === currentPlayerUUID);

        // find the next player that is in the hand
        let nextIndex = (currentIndex + 1) % seats.length;
        let [_, nextPlayerUUID] = seats[nextIndex];
        let counted = 0;

        while (!this.isPlayerEligibleToActNext(nextPlayerUUID) && counted < seats.length) {
            nextIndex = (nextIndex + 1) % seats.length;
            [_, nextPlayerUUID] = seats[nextIndex];
            counted += 1;
        }

        if (counted == seats.length) {
            // TODO remove safeguard - only here to identify bugs
            throw Error(`Went through all players and didnt find the next player ready in hand.`);
        }
        return nextPlayerUUID;
    }

    isSeatTaken(seatNumber: number) {
        return Object.entries(this.gameState.players).some(([uuid, player]) => player.seatNumber === seatNumber);
    }

    isValidSeat(seatNumber: number) {
        return seatNumber >= 0 && seatNumber < this.gameState.gameParameters.maxPlayers;
    }

    shouldDealNextHand() {
        return this.gameState.shouldDealNextHand;
    }

    // TODO deck breaks immutability
    drawCard() {
        return this.deckService.drawCard(this.gameState.deck);
    }

    dealCardsToBoard(amount: number) {
        const newCards = [...Array(amount).keys()].map((_) => this.drawCard());
        this.updateGameState({ board: [...this.getBoard(), ...newCards] });
    }

    dealCardsToPlayer(amount: number, playerUUID: string) {
        const newCards = [...Array(amount).keys()].map((_) => this.drawCard());
        this.updatePlayer(playerUUID, { holeCards: newCards });
    }

    /* Initialization methods */

    // TODO validation around this method. Shouldn't be executed when table is not intialized.
    initConnectedClient(clientUUID: string, ws: WebSocket) {
        const client = this.gameState.table.activeConnections.get(clientUUID);
        if (client) {
            this.resetClientWebsocket(clientUUID, ws);
        } else {
            const newClient = this.createConnectedClient(clientUUID, ws);
            this.gameState = {
                ...this.gameState,
                table: {
                    ...this.gameState.table,
                    activeConnections: new Map([...this.gameState.table.activeConnections, [clientUUID, newClient]]),
                },
            };
        }
    }

    resetClientWebsocket(clientUUID: string, ws: WebSocket) {
        this.gameState.table.activeConnections.get(clientUUID).ws = ws;
    }

    initGame(newGameForm: NewGameForm) {
        this.gameState = {
            ...cleanGameState,
            table: this.initTable(newGameForm),
            gameParameters: {
                smallBlind: Number(newGameForm.smallBlind),
                bigBlind: Number(newGameForm.bigBlind),
                gameType: newGameForm.gameType,
                timeToAct: Number(newGameForm.timeToAct) * 1000,
                maxBuyin: Number(newGameForm.maxBuyin),
                maxPlayers: 9,
                // consider adding timeToAct and maxPlayers to form
            },
        };
        this.timerManager.cancelStateTimer();
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

    initializeNewDeck() {
        this.updateGameState({ deck: this.deckService.newDeck() });
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

    addNewPlayerToGame(clientUUID: string, request: JoinTableRequest) {
        const name = request.name;
        const buyin = request.buyin;
        const player = this.createNewPlayer(name, buyin);

        // TODO remove temporary logic
        // this deletes previous player association and replaces it
        // with new one
        const client = this.getConnectedClient(clientUUID);
        if (client.playerUUID) {
            this.updateGameState({
                players: Object.fromEntries(
                    Object.entries(this.getPlayers()).filter(([uuid, player]) => uuid !== client.playerUUID),
                ),
            });
        }
        // -----

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

    setPlayerStraddle(playerUUID: string, straddle: boolean) {
        this.updatePlayer(playerUUID, { straddle: straddle });
    }

    sitDownPlayer(playerUUID: string, seatNumber: number) {
        this.updatePlayer(playerUUID, { sitting: true, sittingOut: false, seatNumber: seatNumber });
    }

    standUpPlayer(playerUUID: string) {
        this.updatePlayer(playerUUID, { sitting: false, sittingOut: false, seatNumber: -1 });
    }

    getFirstToAct() {
        return this.gameState.firstToAct;
    }

    setFirstToAct(playerUUID: string) {
        this.updateGameState({ firstToAct: playerUUID });
    }

    setCurrentPlayerToAct(playerUUID: string) {
        this.updateGameState({ currentPlayerToAct: playerUUID });
    }

    setBettingRoundStage(bettingRoundStage: BettingRoundStage) {
        this.updateGameState({ bettingRoundStage });
    }

    setPlayerLastActionType(playerUUID: string, lastActionType: BettingRoundActionType) {
        this.updatePlayer(playerUUID, { lastActionType });
    }

    setUnsetQueuedAction() {
        this.updateGameState({
            unsetQueuedAction: true,
        });
    }

    getPlayerHandDescription(playerUUID: string) {
        const bestHand = this.handSolverService.computeBestHandFromCards([
            ...this.getBoard(),
            ...this.getPlayer(playerUUID).holeCards,
        ]);
        return bestHand.descr;
    }

    getGameType(): GameType {
        return this.gameState.gameParameters.gameType;
    }

    // TODO
    getAllowStraddle(): boolean {
        return true;
    }

    getChips(playerUUID: string) {
        return this.getPlayer(playerUUID).chips;
    }

    getPlayerBetAmount(playerUUID: string) {
        return this.getPlayer(playerUUID).betAmount;
    }

    setPlayerBetAmount(playerUUID: string, betAmount: number) {
        const chips = this.getPlayer(playerUUID).chips;
        // TODO remove this logic from the setter.
        this.updatePlayer(playerUUID, { betAmount: betAmount > chips ? chips : betAmount });
    }

    clearStateOfRoundInfo() {
        this.updatePlayers((player) => ({
            lastActionType: BettingRoundActionType.NOT_IN_HAND,
            holeCards: [],
            handDescription: '',
            winner: false,
            betAmount: 0,
            cardsAreHidden: true,
        }));

        this.updateGameState({
            board: [],
            bettingRoundStage: BettingRoundStage.WAITING,
            firstToAct: '',
            currentPlayerToAct: '',
            pots: [],
            deck: {
                cards: [],
            },
        });
    }

    /** Includes all players that were dealt in pre-flop. */
    getPlayersDealtIn() {
        return Object.values(this.gameState.players).filter((player) => this.wasPlayerDealtIn(player.uuid));
    }

    getPlayersReadyToPlay() {
        return Object.values(this.gameState.players).filter((player) => this.isPlayerReadyToPlay(player.uuid));
    }

    wasPlayerDealtIn(playerUUID: string) {
        return this.getPlayer(playerUUID).holeCards.length > 0;
    }

    clearCurrentPlayerToAct() {
        this.updateGameState({
            currentPlayerToAct: '',
        });
    }

    getHighestBet() {
        const playersInHand = this.getPlayersDealtIn();
        assert(playersInHand.length > 0, 'playersInHand.length was <= 0');

        return playersInHand.reduce((max, player) => {
            return player.betAmount > max ? player.betAmount : max;
        }, 0);
    }

    isPlayerAllIn(playerUUID: string): boolean {
        const player = this.getPlayer(playerUUID);
        return player.lastActionType === BettingRoundActionType.ALL_IN;
    }

    getPlayersAllIn(): string[] {
        return Object.entries(this.gameState.players)
            .filter(([uuid, player]) => this.isPlayerAllIn(uuid))
            .map(([uuid, player]) => uuid);
    }

    isAllInRunOut() {
        const playersAllIn = this.getPlayersAllIn();
        const playersInHand = this.getPlayersInHand();
        return playersAllIn.length >= playersInHand.length - 1;
    }

    hasPlayerPutAllChipsInThePot(playerUUID: string): boolean {
        return this.getChips(playerUUID) === this.getPlayerBetAmount(playerUUID);
    }

    // TODO this should go in gamePlay service
    // TODO redesign this
    // TODO it would probably be correct to create a PLACE_BLIND action such that
    // you dont have to bake extra logic around WAITING_TO_ACT
    haveAllPlayersActed() {
        return this.getPlayersDealtIn().every(
            (player) =>
                player.lastActionType !== BettingRoundActionType.WAITING_TO_ACT &&
                player.lastActionType !== BettingRoundActionType.PLACE_BLIND &&
                (this.hasPlayerFolded(player.uuid) ||
                    player.betAmount === this.getHighestBet() ||
                    this.isPlayerAllIn(player.uuid)),
        );
    }

    getWinners() {
        return Object.entries(this.gameState.players)
            .filter(([uuid, player]) => player.winner)
            .map(([uuid, player]) => uuid);
    }

    currentHandHasResult() {
        return this.getWinners().length > 0;
    }

    getNextBettingRoundStage() {
        const bettingRoundStage = this.gameState.bettingRoundStage;
        assert(bettingRoundStage !== BettingRoundStage.SHOWDOWN, 'This method shouldnt be called after showdown.');
        return BETTING_ROUND_STAGES[BETTING_ROUND_STAGES.indexOf(bettingRoundStage) + 1];
    }

    incrementBettingRoundStage() {
        this.updateGameState({ bettingRoundStage: this.getNextBettingRoundStage() });
    }

    clearBettingRoundStage() {
        this.updateGameState({ bettingRoundStage: BettingRoundStage.WAITING });
    }
}
