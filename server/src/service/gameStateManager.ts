import { Service } from 'typedi';

import {
    GameState,
    getCleanGameState,
    ServerStateKey,
    GameStage,
    ALL_STATE_KEYS,
    Pot,
    QueuedServerAction,
    ConnectedClient,
} from '../../../ui/src/shared/models/gameState';
import {
    GameType,
    GameParameters,
    BETTING_ROUND_STAGES,
    BettingRoundStage,
    BettingRoundAction,
    BettingRoundActionType,
} from '../../../ui/src/shared/models/game';
import { Player, getCleanPlayer, TIME_BANKS_DEFAULT } from '../../../ui/src/shared/models/player';
import { DeckService } from './deckService';
import { getLoggableGameState } from '../../../ui/src/shared/util/util';
import { NewGameForm, JoinTableRequest, ClientActionType } from '../../../ui/src/shared/models/api';
import { HandSolverService } from './handSolverService';
import { TimerManager } from './timerManager';
import { Hand, Card, cardsAreEqual, convertHandToCardArray, Suit } from '../../../ui/src/shared/models/cards';
import { LedgerService } from './ledgerService';
import { AwardPot } from '../../../ui/src/shared/models/uiState';
import { logger } from '../logger';
import { ClientUUID, makeBlankUUID, PlayerUUID, generatePlayerUUID } from '../../../ui/src/shared/models/uuid';

// TODO Re-organize methods in some meaningful way

@Service()
export class GameStateManager {
    private gameState: Readonly<GameState> = getCleanGameState();

    // TODO place updatedKey logic into a seperate ServerStateManager file.
    updatedKeys: Set<ServerStateKey> = ALL_STATE_KEYS;

    loadGameState(gs: GameState) {
        this.gameState = gs;
    }

    getUpdatedKeys(): Set<ServerStateKey> {
        return this.updatedKeys;
    }

    addUpdatedKeys(...updatedKeys: ServerStateKey[]) {
        updatedKeys.forEach((updatedKey) => this.updatedKeys.add(updatedKey));
    }

    clearUpdatedKeys() {
        this.updatedKeys.clear();
    }

    setUpdatedKeys(updatedKeys: Set<ServerStateKey>) {
        this.updatedKeys = new Set(updatedKeys);
    }

    constructor(
        private readonly deckService: DeckService,
        private readonly handSolverService: HandSolverService,
        private readonly timerManager: TimerManager,
        private readonly ledgerService: LedgerService,
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
            ...getCleanPlayer(),
            uuid: generatePlayerUUID(),
            name,
            chips,
            timeBanksLeft: TIME_BANKS_DEFAULT,
        };
    }

    createConnectedClient(clientUUID: ClientUUID): ConnectedClient {
        return {
            uuid: clientUUID,
            playerUUID: makeBlankUUID(),
        };
    }

    updatePlayer(playerUUID: PlayerUUID, updates: Partial<Player>) {
        const player = this.getPlayer(playerUUID);

        this.updateGameState({
            players: {
                ...this.gameState.players,
                [player.uuid]: { ...player, ...updates },
            },
        });
    }
    updatePlayers(updateFn: (player: Player) => Partial<Player>) {
        Object.entries(this.gameState.players).forEach(([uuid, player]) =>
            this.updatePlayer(uuid as PlayerUUID, updateFn(player)),
        );
    }

    filterPlayerUUIDs(filterFn: (playerUUID: PlayerUUID) => boolean): PlayerUUID[] {
        return Object.keys(this.gameState.players).filter(filterFn) as PlayerUUID[];
    }

    forEveryPlayer(performFn: (player: Player) => void) {
        Object.entries(this.gameState.players).forEach(([uuid, player]) => performFn(player));
    }

    forEveryClient(performFn: (client: ConnectedClient) => void) {
        [...this.gameState.activeConnections.entries()].forEach(([clientUUID, client]) => performFn(client));
    }

    getConnectedClient(clientUUID: ClientUUID) {
        return this.gameState.activeConnections.get(clientUUID);
    }

    getClientByPlayerUUID(playerUUID: PlayerUUID): ClientUUID {
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
            logger.error(
                `clients.length was ${clients.length} and not 1. GameState: ${getLoggableGameState(this.gameState)}`,
            );
        }
        return clients[0].uuid;
    }

    getConnectedClients() {
        return this.gameState.activeConnections.values();
    }

    getPlayerByClientUUID(clientUUID: ClientUUID): Player {
        const connectedClient = this.getConnectedClient(clientUUID);
        const playerUUID = connectedClient.playerUUID;
        return this.getPlayer(playerUUID);
    }

    getPlayer(playerUUID: PlayerUUID): Player {
        return this.gameState.players[playerUUID];
    }

    // TODO when branded types can be used as index signatures, replace string with PlayerUUID
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

    getDealerUUID(): PlayerUUID {
        return this.gameState.dealerUUID;
    }

    getBigBlindUUID(): PlayerUUID {
        return this.gameState.bigBlindUUID;
    }

    getSmallBlindUUID(): PlayerUUID {
        return this.gameState.smallBlindUUID;
    }

    getStraddleUUID(): PlayerUUID {
        return this.gameState.straddleUUID;
    }

    getBoard() {
        return this.gameState.board;
    }

    addPlayerChips(playerUUID: PlayerUUID, addChips: number) {
        this.ledgerService.addBuyin(this.getClientByPlayerUUID(playerUUID), addChips);
        this.updatePlayer(playerUUID, { chips: this.getChips(playerUUID) + addChips });
    }

    setPlayerChips(playerUUID: PlayerUUID, setChips: number) {
        const chipDifference = setChips - this.getChips(playerUUID);
        if (chipDifference > 0) {
            this.ledgerService.addBuyin(this.getClientByPlayerUUID(playerUUID), chipDifference);
        } else {
            logger.warning(
                `gameStateManager.setPlayerChips has been called with a chip amount that is less than the player's 
                current stack. This is either a bug, or being used for development`,
            );
        }

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

    getTotalPlayerTimeToAct() {
        return this.getTimeToAct() + this.getSumTimeBankValueThisAction();
    }

    getTimeBanksLeft(playerUUID: PlayerUUID) {
        return this.getPlayer(playerUUID).timeBanksLeft;
    }

    decrementTimeBanksLeft(playerUUID: PlayerUUID) {
        this.updatePlayer(playerUUID, { timeBanksLeft: this.getTimeBanksLeft(playerUUID) - 1 });
    }

    getTimeBanksUsedThisAction() {
        return this.gameState.timeBanksUsedThisAction;
    }

    getSumTimeBankValueThisAction() {
        return this.getTimeBanksUsedThisAction() * this.getTimeBankValue();
    }

    incrementTimeBanksUsedThisAction() {
        this.updateGameState({
            timeBanksUsedThisAction: this.getTimeBanksUsedThisAction() + 1,
        });
    }

    clearTimeBanksUsedThisAction() {
        this.updateGameState({ timeBanksUsedThisAction: 0 });
    }

    getPots() {
        return this.gameState.pots;
    }

    getActivePotValue() {
        // get pot with least number of contestors
        const activePot = this.gameState.pots.reduce(
            (minPot, pot, i) => (i === 0 || pot.contestors.length < minPot.contestors.length ? pot : minPot),
            { contestors: [], value: 0 },
        );
        return activePot.value;
    }

    getInactivePotsValues() {
        const ans: number[] = [];
        let [min, minI] = [Number.POSITIVE_INFINITY, 0];
        this.gameState.pots.forEach((pot, i) => {
            if (min > pot.contestors.length) {
                min = pot.contestors.length;
                minI = i;
            }
            ans.push(pot.value);
        });
        ans.splice(minI, 1);
        return ans;
    }

    popPot(): Pot {
        const potsLength = this.gameState.pots.length;
        if (!(potsLength > 0)) {
            throw Error(
                `Cannot call popPot when length of pot array is zero. This is a bug. GameState: ${getLoggableGameState(
                    this.gameState,
                )}`,
            );
        }
        const poppedPot = this.gameState.pots[0];
        this.updateGameState({ pots: this.gameState.pots.filter((pot) => pot != poppedPot) });
        if (!(this.gameState.pots.length === potsLength - 1)) {
            throw Error(
                `Pot array should have pot removed after calling popPot. This is a bug. GameState: ${getLoggableGameState(
                    this.gameState,
                )}`,
            );
        }
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

    getHandWinners(): Set<PlayerUUID> {
        return this.gameState.handWinners;
    }

    addHandWinner(playerUUID: PlayerUUID) {
        this.updateGameState({
            handWinners: new Set([...this.getHandWinners(), playerUUID]),
        });
    }

    getSB() {
        return this.gameState.gameParameters.smallBlind;
    }

    getBB() {
        return this.gameState.gameParameters.bigBlind;
    }

    getTimeBankValue() {
        return this.gameState.gameParameters.timeBankValue;
    }

    getBettingRoundActionTypes() {
        return this.filterPlayerUUIDs((playerUUID) => this.wasPlayerDealtIn(playerUUID)).map(
            (playerUUID) => this.getPlayer(playerUUID).lastActionType,
        );
    }

    getBettingRoundStage() {
        return this.gameState.bettingRoundStage;
    }

    getSeats() {
        const seats: [number, PlayerUUID][] = Object.values(this.gameState.players)
            .filter((player) => player.seatNumber >= 0)
            .map((player) => [player.seatNumber, player.uuid]);
        seats.sort();
        return seats;
    }

    getPositionRelativeToDealer(playerUUID: PlayerUUID) {
        const numPlayers = this.getPlayersDealtIn().length;
        return (
            this.getPlayer(playerUUID).seatNumber +
            ((numPlayers - this.getPlayer(this.getDealerUUID()).seatNumber) % numPlayers)
        );
    }

    comparePositions(playerA: PlayerUUID, playerB: PlayerUUID) {
        const posA = this.getPositionRelativeToDealer(playerA);
        const posB = this.getPositionRelativeToDealer(playerB);

        if (playerA === playerB) {
            throw Error(
                `gameStateManager.comparePositions was invoked with the same player. ` +
                    `This is most likely a bug. GameState: ${getLoggableGameState(this.gameState)}`,
            );
        }
        if (posA === posB) {
            throw Error(
                `gameStateManager.getPositionRelativeToDealer returned ` +
                    `the same position for two different players. GameState: ${getLoggableGameState(this.gameState)}`,
            );
        }
        // they cannot be equal
        return posA < posB ? -1 : 1;
    }

    getDeck() {
        return this.gameState.deck;
    }

    getPlayersInHand(): PlayerUUID[] {
        return this.filterPlayerUUIDs((playerUUID) => this.isPlayerInHand(playerUUID));
    }

    getPlayersEligibleToActNext(): PlayerUUID[] {
        return this.filterPlayerUUIDs((playerUUID) => this.isPlayerEligibleToActNext(playerUUID));
    }

    gameIsWaitingForBetAction() {
        return this.gameState.gameStage === GameStage.WAITING_FOR_BET_ACTION;
    }

    getMinimumBetSize() {
        const minimumBet = this.getMinRaiseDiff() + this.getPreviousRaise() + this.getPartialAllInLeftOver();
        return minimumBet;
    }

    getMinimumBetSizeForPlayer(playerUUID: PlayerUUID) {
        const player = this.getPlayer(playerUUID);
        const minimumBetSize = this.getMinimumBetSize();
        return minimumBetSize > player.chips ? player.chips : minimumBetSize;
    }

    getPotSizedBetForPlayer(playerUUID: PlayerUUID) {
        const player = this.getPlayer(playerUUID);
        return this.getFullPot() + this.getPreviousRaise() * 2 - player.betAmount;
    }

    shouldDealNextHand() {
        return this.gameState.shouldDealNextHand;
    }

    isPlayerReadyToPlay(playerUUID: PlayerUUID): boolean {
        return this.getPlayer(playerUUID).sitting && !this.getPlayer(playerUUID).sittingOut;
    }

    isPlayerInHand(playerUUID: PlayerUUID): boolean {
        return !this.hasPlayerFolded(playerUUID) && this.wasPlayerDealtIn(playerUUID);
    }

    isPlayerFacingBet(playerUUID: PlayerUUID): boolean {
        return this.getPreviousRaise() + this.getPartialAllInLeftOver() > this.getPlayerBetAmount(playerUUID);
    }

    // TODO
    isPlayerFacingRaise(playerUUID: PlayerUUID): boolean {
        return false;
    }

    isPlayerEligibleToActNext(playerUUID: PlayerUUID): boolean {
        return (
            !this.hasPlayerFolded(playerUUID) && this.wasPlayerDealtIn(playerUUID) && !this.isPlayerAllIn(playerUUID)
        );
    }

    // incorrectly returning true if someone goes all in preflop and big blind doesnt have chance to fold/call
    isBettingRoundOver(): boolean {
        return this.haveAllPlayersActed();
    }

    hasPlayerFolded(playerUUID: PlayerUUID): boolean {
        return this.getPlayer(playerUUID).lastActionType === BettingRoundActionType.FOLD;
    }

    hasEveryoneButOnePlayerFolded(): boolean {
        return this.getPlayersInHand().length === 1;
    }

    /**
     * Function is executed before every transition to INITIALIZE_NEW_HAND state to see if we
     * can conitnue playing and deal people in.
     */
    canDealNextHand(): boolean {
        return this.shouldDealNextHand() && this.getPlayersReadyToPlay().length >= 2;
    }

    /**
     * Used to toggle the appearance of the start game button on the table. This button should
     * be visible to a player if the player is ready to play (sitting down),
     * if the game is not currently in progress, and if there are enough players to play.
     */
    canPlayerStartGame(playerUUID: PlayerUUID) {
        return (
            this.isPlayerReadyToPlay(playerUUID) &&
            this.getPlayersReadyToPlay().length >= 2 &&
            !this.isGameInProgress() &&
            this.isPlayerAdmin(this.getClientByPlayerUUID(playerUUID))
        );
    }

    /**
     * Used to toggle whether the admins menus play button is start or stop while hand is occuring.
     * Additionally globally toggles message to all players that game will be paused after next hand.
     */
    gameWillStopAfterHand() {
        return this.isGameInProgress() && this.shouldDealNextHand() === false;
    }

    isGameInProgress() {
        return this.getGameStage() !== GameStage.NOT_IN_PROGRESS;
    }

    willPlayerStraddle(playerUUID: PlayerUUID): boolean {
        const player = this.getPlayer(playerUUID);
        return player.willStraddle;
    }

    getNextPlayerReadyToPlayUUID(currentPlayerUUID: PlayerUUID) {
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

    getNextPlayerInHandUUID(currentPlayerUUID: PlayerUUID) {
        //TODO duplicate safeguard.
        if (this.haveAllPlayersActed()) {
            throw Error('getNextPlayerInHandUUID shouldnt be called if all plalyers have acted.');
        }
        if (!currentPlayerUUID) {
            throw Error('getNextPlayerInHandUUID shouldnt be called without a currentPlalyerUUID');
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

    // TODO deck breaks immutability
    drawCard() {
        return this.deckService.drawCard(this.gameState.deck);
    }

    dealCardsToBoard(amount: number) {
        const newCards = [...Array(amount).keys()].map((_) => this.drawCard());
        this.updateGameState({ board: [...this.getBoard(), ...newCards] });
    }

    dealCardsToPlayer(amount: number, playerUUID: PlayerUUID) {
        const newCards = [...Array(amount).keys()].map((_) => this.drawCard());
        this.updatePlayer(playerUUID, { holeCards: newCards });
    }

    /* Initialization methods */

    // TODO validation around this method. Shouldn't be executed when table is not intialized.
    // TODO break away client logic into server state manager.
    // TODO rename method, as it is not always initializing a client.
    initConnectedClient(clientUUID: ClientUUID) {
        const client = this.gameState.activeConnections.get(clientUUID);
        if (!client) {
            if (!this.gameState.admin) {
                this.initAdmin(clientUUID);
            }
            const newClient = this.createConnectedClient(clientUUID);
            this.gameState = {
                ...this.gameState,
                activeConnections: new Map([...this.gameState.activeConnections, [clientUUID, newClient]]),
            };
            this.ledgerService.initRow(clientUUID);
        }
    }

    initAdmin(clientUUID: ClientUUID) {
        this.updateGameState({
            admin: clientUUID,
        });
    }

    getAdminUUID() {
        return this.gameState.admin;
    }

    initGame(newGameForm: NewGameForm) {
        const newGame = {
            ...getCleanGameState(),
            table: this.initTable(),
            gameParameters: {
                smallBlind: Number(newGameForm.smallBlind),
                bigBlind: Number(newGameForm.bigBlind),
                gameType: newGameForm.gameType || GameType.NLHOLDEM,
                timeToAct: Number(newGameForm.timeToAct) * 1000,
                timeBankValue: 60 * 1000, // TODO add to game form
                maxBuyin: Number(newGameForm.maxBuyin),
                maxPlayers: 9,
                // consider adding timeToAct and maxPlayers to form
            },
        };
        this.timerManager.cancelStateTimer();
        this.gameState = { ...newGame };
    }

    initTable() {
        // oH nO a pLaiNtEXt pAssW0Rd!!
        return {
            activeConnections: new Map(),
            admin: '',
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

    queueAction(queuedServerAction: QueuedServerAction) {
        this.updateGameState({
            queuedServerActions: [...this.gameState.queuedServerActions, queuedServerAction],
        });
    }

    getQueuedServerActions(): QueuedServerAction[] {
        return this.gameState.queuedServerActions;
    }

    /* Player operations */

    associateClientAndPlayer(clientUUID: ClientUUID, playerUUID: PlayerUUID): ConnectedClient {
        const connectedClient = this.getConnectedClient(clientUUID);
        return {
            ...connectedClient,
            playerUUID,
        };
    }

    bootPlayerFromGame(playerUUID: PlayerUUID) {
        if (this.isPlayerInHand(playerUUID)) {
            this.queueAction({
                actionType: ClientActionType.BOOTPLAYER,
                args: [playerUUID],
            });
        } else {
            if (this.getPlayer(playerUUID)) {
                this.removePlayerFromPlayers(playerUUID);
                this.deassociateClientAndPlayer(playerUUID);
            }
        }
    }

    removePlayerFromPlayers(playerUUID: PlayerUUID) {
        const player = this.getPlayer(playerUUID);
        if (player.sitting) {
            this.standUpPlayer(playerUUID);
        }
        this.updateGameState({
            players: Object.fromEntries(
                Object.entries(this.getPlayers()).filter(([uuid, player]) => uuid !== playerUUID),
            ),
        });
    }

    // TODO if you need to perform more operations like this, you need to create helpers
    deassociateClientAndPlayer(playerUUID: PlayerUUID) {
        const playerClientUUID = this.getClientByPlayerUUID(playerUUID);
        if (!playerClientUUID) {
            throw Error('deassociateClientAndPlayer called with a player that doesnt have a client.');
        }
        this.updateGameState({
            activeConnections: new Map(
                [...this.gameState.activeConnections].map(([clientUUID, client]) => [
                    clientUUID,
                    {
                        ...client,
                        playerUUID: clientUUID === playerClientUUID ? makeBlankUUID() : client.playerUUID,
                    },
                ]),
            ),
        });
    }

    addNewPlayerToGame(clientUUID: ClientUUID, request: JoinTableRequest) {
        const name = request.name;
        const buyin = request.buyin;
        const player = this.createNewPlayer(name, buyin);

        // TODO remove temporary logic
        // this deletes previous player association and replaces it
        // with new one
        const client = this.getConnectedClient(clientUUID);
        if (client.playerUUID) {
            this.removePlayerFromPlayers(client.playerUUID);
        }
        // -----

        const associatedClient = this.associateClientAndPlayer(clientUUID, player.uuid);
        this.gameState = {
            ...this.gameState,
            players: { ...this.gameState.players, [player.uuid]: player },
            activeConnections: new Map([
                ...this.gameState.activeConnections,
                [associatedClient.uuid, associatedClient],
            ]),
        };

        this.ledgerService.addAlias(clientUUID, name);
        this.ledgerService.addBuyin(clientUUID, buyin);
    }

    setWillPlayerStraddle(playerUUID: PlayerUUID, willStraddle: boolean) {
        this.updatePlayer(playerUUID, { willStraddle });
    }

    sitDownPlayer(playerUUID: PlayerUUID, seatNumber: number) {
        this.updatePlayer(playerUUID, { sitting: true, sittingOut: false, seatNumber: seatNumber });
    }

    standUpPlayer(playerUUID: PlayerUUID) {
        this.updatePlayer(playerUUID, { sitting: false, sittingOut: false, seatNumber: -1 });
        const clientUUID = this.getClientByPlayerUUID(playerUUID);
        this.ledgerService.addWalkaway(clientUUID, this.getPlayer(playerUUID).chips);
    }

    sitOutPlayer(playerUUID: PlayerUUID) {
        this.updatePlayer(playerUUID, { sittingOut: true });
    }

    sitInPlayer(playerUUID: PlayerUUID) {
        this.updatePlayer(playerUUID, { sittingOut: false });
    }

    canPlayerShowCards(playerUUID: PlayerUUID) {
        // obiviously never let player show cards who wasn't dealt cards
        if (!this.wasPlayerDealtIn(playerUUID)) {
            return false;
        }
        const numPlayersInHand = this.getPlayersInHand().length;
        return (
            // everyone can show if on player left in hand
            numPlayersInHand === 1 ||
            // players who are heads up can show anytime
            (this.isPlayerInHand(playerUUID) && numPlayersInHand === 2) ||
            // all players can show after betting finishes if we are on river
            (this.getGameStage() === GameStage.FINISH_BETTING_ROUND &&
                this.getBettingRoundStage() === BettingRoundStage.RIVER) ||
            // all players can show in showdown
            this.getGameStage() === GameStage.SHOW_WINNER
        );
    }

    setPlayerCardsVisible(playerUUID: PlayerUUID, matchCard: Card) {
        const player = this.getPlayer(playerUUID);
        this.updatePlayer(playerUUID, {
            holeCards: player.holeCards.map((holeCard) => {
                if (holeCard.rank === matchCard.rank && holeCard.suit === matchCard.suit) {
                    return { ...holeCard, visible: true };
                }
                return holeCard;
            }),
        });
    }

    setPlayerCardsAllVisible(playerUUID: PlayerUUID) {
        const player = this.getPlayer(playerUUID);
        this.updatePlayer(playerUUID, {
            holeCards: player.holeCards.map((c) => {
                return { ...c, visible: true };
            }),
        });
    }

    getFirstToAct() {
        return this.gameState.firstToAct;
    }

    getLastAggressorUUID(): string {
        return this.gameState.lastAggressorUUID;
    }

    setFirstToAct(playerUUID: PlayerUUID) {
        this.updateGameState({ firstToAct: playerUUID });
    }

    setCurrentPlayerToAct(playerUUID: PlayerUUID) {
        this.updateGameState({ currentPlayerToAct: playerUUID });
    }

    setBettingRoundStage(bettingRoundStage: BettingRoundStage) {
        this.updateGameState({ bettingRoundStage });
    }

    setPlayerLastActionType(playerUUID: PlayerUUID, lastActionType: BettingRoundActionType) {
        this.updatePlayer(playerUUID, { lastActionType });
    }

    changePlayerName(playerUUID: PlayerUUID, name: string) {
        this.updatePlayer(playerUUID, { name });
        this.ledgerService.addAlias(this.getClientByPlayerUUID(playerUUID), name);
    }

    getLastBettingRoundAction(): BettingRoundAction {
        return this.gameState.lastBettingRoundAction;
    }

    setLastBettingRoundAction(lastBettingRoundAction: BettingRoundAction) {
        this.updateGameState({ lastBettingRoundAction });
    }

    computeBestHandForPlayer(playerUUID: PlayerUUID): Hand {
        const bestHand =
            this.getGameType() === GameType.PLOMAHA
                ? this.handSolverService.computeBestPLOHand(this.getPlayer(playerUUID).holeCards, this.getBoard())
                : this.handSolverService.computeBestNLEHand(this.getPlayer(playerUUID).holeCards, this.getBoard());
        this.updatePlayer(playerUUID, { bestHand });
        return bestHand;
    }

    isCardInPlayersBestHand(playerUUID: PlayerUUID, card: Card) {
        return convertHandToCardArray(this.getPlayerBestHand(playerUUID)).some((handCard) =>
            cardsAreEqual(handCard, card),
        );
    }

    getPlayerBestHand(playerUUID: PlayerUUID): Hand {
        return this.getPlayer(playerUUID).bestHand;
    }

    getPlayerHandDescription(playerUUID: PlayerUUID): string {
        const bestHand = this.computeBestHandForPlayer(playerUUID);
        return bestHand.descr;
    }

    getGameType(): GameType {
        return this.gameState.gameParameters.gameType;
    }

    getAwardPots(): AwardPot[] {
        const awardPots: AwardPot[] = [];
        for (const player of Object.values(this.getPlayers())) {
            if (player.winner) {
                awardPots.push({ winnerUUID: player.uuid, value: player.chipDelta });
            }
        }
        return awardPots;
    }
    // TODO
    getAllowStraddle(): boolean {
        return true;
    }

    getChips(playerUUID: PlayerUUID) {
        return this.getPlayer(playerUUID).chips;
    }

    getPlayerBetAmount(playerUUID: PlayerUUID) {
        return this.getPlayer(playerUUID).betAmount;
    }

    setPlayerBetAmount(playerUUID: PlayerUUID, betAmount: number) {
        if (betAmount > this.getChips(playerUUID)) {
            throw Error(
                `Player: ${playerUUID} betamount: ${betAmount} is larger than their number of chips: ${this.getChips(
                    playerUUID,
                )}.` + `GameState: ${getLoggableGameState(this.gameState)}`,
            );
        }
        this.updatePlayer(playerUUID, { betAmount });
    }

    clearWinnersAndDeltas() {
        this.updatePlayers((player) => ({
            winner: false,
            chipDelta: 0,
        }));
    }

    clearStateOfHandInfo() {
        this.updatePlayers((player) => ({
            lastActionType: BettingRoundActionType.NOT_IN_HAND,
            holeCards: [],
            handDescription: '',
            bestHand: null,
            winner: false,
            betAmount: 0,
            timeBanksUsedThisAction: 0,
        }));

        // TODO make gameState partial that represents a clean pre-hand state.
        this.updateGameState({
            board: [],
            bettingRoundStage: BettingRoundStage.WAITING,
            firstToAct: makeBlankUUID(),
            currentPlayerToAct: makeBlankUUID(),
            pots: [],
            deck: {
                cards: [],
            },
            handWinners: new Set<PlayerUUID>(),
            smallBlindUUID: makeBlankUUID(),
            bigBlindUUID: makeBlankUUID(),
            straddleUUID: makeBlankUUID(),
        });
    }

    /** Includes all players that were dealt in pre-flop. */
    getPlayersDealtIn() {
        return Object.values(this.gameState.players).filter((player) => this.wasPlayerDealtIn(player.uuid));
    }

    getPlayersReadyToPlay() {
        return Object.values(this.gameState.players).filter((player) => this.isPlayerReadyToPlay(player.uuid));
    }

    wasPlayerDealtIn(playerUUID: PlayerUUID) {
        return this.getPlayer(playerUUID).holeCards.length > 0;
    }

    clearCurrentPlayerToAct() {
        this.updateGameState({
            currentPlayerToAct: makeBlankUUID(),
        });
    }

    getHighestBet() {
        // TODO this could be made more specific to be getPlayersInHand, and not getPlayersDealtIn
        const playersInHand = this.getPlayersDealtIn();
        if (playersInHand.length <= 0) {
            throw Error(`playersInHand.length was <= 0. GameState: ${getLoggableGameState(this.gameState)}`);
        }

        return playersInHand.reduce((max, player) => {
            return player.betAmount > max ? player.betAmount : max;
        }, 0);
    }

    isPlayerAdmin(clientUUID: ClientUUID): boolean {
        return this.getAdminUUID() === clientUUID;
    }

    isPlayerAllIn(playerUUID: PlayerUUID): boolean {
        const player = this.getPlayer(playerUUID);
        return player.lastActionType === BettingRoundActionType.ALL_IN;
    }

    getPlayersAllIn(): PlayerUUID[] {
        return this.filterPlayerUUIDs((playerUUID) => this.isPlayerAllIn(playerUUID));
    }

    isAllInRunOut() {
        const playersAllIn = this.getPlayersAllIn();
        const playersInHand = this.getPlayersInHand();
        return playersAllIn.length >= playersInHand.length - 1;
    }

    hasPlayerPutAllChipsInThePot(playerUUID: PlayerUUID): boolean {
        return this.getChips(playerUUID) === this.getPlayerBetAmount(playerUUID);
    }

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
        return this.filterPlayerUUIDs((playerUUID) => this.getPlayer(playerUUID).winner);
    }

    currentHandHasResult() {
        return this.getWinners().length > 0;
    }

    getNextBettingRoundStage() {
        const bettingRoundStage = this.gameState.bettingRoundStage;
        if (bettingRoundStage === BettingRoundStage.SHOWDOWN) {
            throw Error(
                `This method shouldnt be called after showdown. GameState: ${getLoggableGameState(this.gameState)}`,
            );
        }
        return BETTING_ROUND_STAGES[BETTING_ROUND_STAGES.indexOf(bettingRoundStage) + 1];
    }

    incrementBettingRoundStage() {
        this.updateGameState({ bettingRoundStage: this.getNextBettingRoundStage() });
    }

    clearBettingRoundStage() {
        this.updateGameState({ bettingRoundStage: BettingRoundStage.WAITING });
    }
}
