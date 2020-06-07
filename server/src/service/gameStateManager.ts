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
    MaxBuyinType,
} from '../../../ui/src/shared/models/game';
import { Player, getCleanPlayer } from '../../../ui/src/shared/models/player';
import { DeckService } from './deckService';
import { getLoggableGameState } from '../../../ui/src/shared/util/util';
import { JoinTableRequest, ClientActionType } from '../../../ui/src/shared/models/api';
import { HandSolverService } from './handSolverService';
import {
    Hand,
    Card,
    cardsAreEqual,
    convertHandToCardArray,
    RankAbbrToFullString,
} from '../../../ui/src/shared/models/cards';
import { LedgerService } from './ledgerService';
import { AwardPot } from '../../../ui/src/shared/models/uiState';
import { logger, debugFunc } from '../logger';
import { ClientUUID, makeBlankUUID, PlayerUUID, generatePlayerUUID } from '../../../ui/src/shared/models/uuid';
import { PlayerPosition, PLAYER_POSITIONS_BY_HEADCOUNT } from '../../../ui/src/shared/models/playerPosition';
import { AvatarKeys } from '../../../ui/src/shared/models/assets';
import sortBy from 'lodash/sortBy';

// TODO Re-organize methods in some meaningful way

@Service()
export class GameStateManager {
    private gameState: GameState = getCleanGameState();

    // TODO place updatedKey logic into a seperate ServerStateManager file.
    updatedKeys: Set<ServerStateKey> = ALL_STATE_KEYS;

    loadGameState(gameState: GameState) {
        this.gameState = gameState;
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
        private readonly ledgerService: LedgerService,
    ) {}

    /* Getters */

    getGameState(): GameState {
        return this.gameState;
    }

    getGameStage(): GameStage {
        return this.gameState.gameStage;
    }

    getMaxBuyin(): number {
        const { maxBuyin, minBuyin, maxBuyinType, dynamicMaxBuyin } = this.gameState.gameParameters;
        if (!dynamicMaxBuyin) return maxBuyin;

        const sortedPlayer: Player[] = sortBy(
            Object.values(this.gameState.players),
            (player: Player) => player.chips * -1,
        );
        switch (maxBuyinType) {
            case MaxBuyinType.TopStack:
                return Math.max(maxBuyin, sortedPlayer[0]?.chips || 0);
            case MaxBuyinType.HalfTopStack:
                return Math.max(maxBuyin, Math.floor((sortedPlayer[0]?.chips || 0) / 2));
            case MaxBuyinType.SecondStack:
                return Math.max(maxBuyin, sortedPlayer[1]?.chips || 0);
            case MaxBuyinType.AverageStack:
                const playerArr = Object.values(this.gameState.players);
                const avgStackSize = Math.floor(
                    playerArr.reduce((sum, player) => sum + player.chips, 0) / playerArr.length,
                );
                return Math.max(maxBuyin, avgStackSize || 0);

            default:
                logger.error('received unsupported maxBuyinType in params: ', this.gameState.gameParameters);
                return maxBuyin;
        }
    }

    updateGameStage(gameStage: GameStage) {
        this.gameState.gameStage = gameStage;
    }

    updateGameState(updates: Partial<GameState>) {
        this.gameState = {
            ...this.gameState,
            ...updates,
        };
    }

    createNewPlayer(name: string, chips: number, avatarKey: AvatarKeys): Player {
        return {
            ...getCleanPlayer(),
            uuid: generatePlayerUUID(),
            name,
            chips,
            avatarKey,
            timeBanksLeft: this.getGameParameters().numberTimeBanks,
        };
    }

    createConnectedClient(clientUUID: ClientUUID): ConnectedClient {
        return {
            uuid: clientUUID,
            playerUUID: makeBlankUUID(),
        };
    }

    updatePlayer(playerUUID: PlayerUUID, updates: Partial<Player>, create?: boolean) {
        const player = this.getPlayer(playerUUID);
        this.getPlayers()[create ? playerUUID : player.uuid] = {
            ...player,
            ...updates,
        };
    }
    updatePlayers(updateFn: (player: Player) => Partial<Player>) {
        Object.entries(this.gameState.players).forEach(([uuid, player]) =>
            this.updatePlayer(uuid as PlayerUUID, updateFn(player)),
        );
    }

    filterPlayerUUIDs(filterFn: (playerUUID: PlayerUUID) => boolean): PlayerUUID[] {
        return Object.keys(this.gameState.players).filter(filterFn) as PlayerUUID[];
    }

    forEveryPlayerUUID(performFn: (playerUUID: PlayerUUID) => void) {
        Object.keys(this.gameState.players).forEach(performFn);
    }

    forEveryPlayer(performFn: (player: Player) => void) {
        Object.values(this.gameState.players).forEach(performFn);
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

    getGameParameters(): GameParameters {
        return this.gameState.gameParameters;
    }

    getMaxPlayers(): number {
        return this.gameState.gameParameters.maxPlayers;
    }

    getSittingPlayers(): Player[] {
        return Object.values(this.getPlayers()).filter((player) => player.sitting);
    }

    areOpenSeats(): boolean {
        return this.getMaxPlayers() > Object.values(this.getPlayers()).length;
    }

    // TODO when branded types can be used as index signatures, replace string with PlayerUUID
    getPlayers(): { [key: string]: Player } {
        return this.gameState.players;
    }

    getPreviousRaise() {
        return this.gameState.previousRaise;
    }

    setPreviousRaise(previousRaise: number) {
        this.gameState.previousRaise = previousRaise;
    }

    getPartialAllInLeftOver() {
        return this.gameState.partialAllInLeftOver;
    }

    setPartialAllInLeftOver(partialAllInLeftOver: number) {
        this.gameState.partialAllInLeftOver = partialAllInLeftOver;
    }

    getMinRaiseDiff() {
        return this.gameState.minRaiseDiff;
    }

    setMinRaiseDiff(minRaiseDiff: number) {
        this.gameState.minRaiseDiff = minRaiseDiff;
    }

    getCurrentPlayerToAct() {
        return this.gameState.currentPlayerToAct;
    }

    getDealerUUID(): PlayerUUID {
        return this.gameState.dealerUUID;
    }

    setDealerUUID(dealerUUID: PlayerUUID): void {
        this.gameState.dealerUUID = dealerUUID;
    }

    getBigBlindUUID(): PlayerUUID {
        return this.gameState.bigBlindUUID;
    }

    setBigBlindUUID(bigBlindUUID: PlayerUUID): void {
        this.gameState.bigBlindUUID = bigBlindUUID;
    }

    getSmallBlindUUID(): PlayerUUID {
        return this.gameState.smallBlindUUID;
    }

    setSmallBlindUUID(smallBlindUUID: PlayerUUID) {
        this.gameState.smallBlindUUID = smallBlindUUID;
    }

    getStraddleUUID(): PlayerUUID {
        return this.gameState.straddleUUID;
    }

    setStraddleUUID(straddleUUID: PlayerUUID) {
        this.gameState.straddleUUID = straddleUUID;
    }

    getHandNumber() {
        return this.gameState.handNumber;
    }

    incrementHandNumber() {
        this.gameState.handNumber += 1;
    }

    getBoard(): ReadonlyArray<Card> {
        return this.gameState.board;
    }

    playerBuyinAddChips(playerUUID: PlayerUUID, addChips: number) {
        if (addChips <= 0) {
            logger.error(
                `gameStateManager.playerBuyinAddChips was called with a zero or negative chip amount: ${addChips}`,
            );
            return;
        }
        this.ledgerService.addBuyin(this.getClientByPlayerUUID(playerUUID), addChips);
        const newChipAmount = this.getPlayerChips(playerUUID) + addChips;
        this.setPlayerChips(playerUUID, newChipAmount);
    }

    playerBuyinSetChips(playerUUID: PlayerUUID, setChips: number) {
        const chipDifference = setChips - this.getPlayerChips(playerUUID);
        if (chipDifference > 0) {
            this.ledgerService.addBuyin(this.getClientByPlayerUUID(playerUUID), chipDifference);
        } else {
            logger.warning(
                `gameStateManager.playerBuyinSetChips has been called with a chip amount that is less than the player's 
                current stack. This is either a bug, or being used for development`,
            );
        }

        this.setPlayerChips(playerUUID, setChips);
    }

    subtractBetAmountFromChips(playerUUID: PlayerUUID) {
        const player = this.getPlayer(playerUUID);
        player.chips -= player.betAmount;
    }

    addPlayerChips(playerUUID: PlayerUUID, addChips: number) {
        this.getPlayer(playerUUID).chips += addChips;
    }

    setPlayerChips(playerUUID: PlayerUUID, chips: number) {
        this.getPlayer(playerUUID).chips = chips;
    }

    setPlayerQuitting(playerUUID: PlayerUUID, quitting: boolean) {
        this.getPlayer(playerUUID).quitting = quitting;
    }

    // returns time in milliseconds
    getTimeCurrentPlayerTurnStarted() {
        return this.gameState.timeCurrentPlayerTurnStarted;
    }

    setTimeCurrentPlayerTurnStarted(timeCurrentPlayerTurnStarted: number) {
        this.gameState.timeCurrentPlayerTurnStarted = timeCurrentPlayerTurnStarted;
    }

    // returns time in milliseconds
    getCurrentPlayerTurnElapsedTime() {
        return Date.now() - this.getTimeCurrentPlayerTurnStarted();
    }

    getTimeToAct() {
        return this.gameState.gameParameters.timeToAct * 1000;
    }

    getTotalPlayerTimeToAct() {
        return this.getTimeToAct() + this.getSumTimeBankValueThisAction();
    }

    getTimeBanksLeft(playerUUID: PlayerUUID) {
        return this.getPlayer(playerUUID).timeBanksLeft;
    }

    decrementTimeBanksLeft(playerUUID: PlayerUUID) {
        this.getPlayer(playerUUID).timeBanksLeft -= 1;
    }

    getTimeBanksUsedThisAction() {
        return this.gameState.timeBanksUsedThisAction;
    }

    getSumTimeBankValueThisAction() {
        return this.getTimeBanksUsedThisAction() * this.getTimeBankValue();
    }

    incrementTimeBanksUsedThisAction() {
        this.gameState.timeBanksUsedThisAction += 1;
    }

    clearTimeBanksUsedThisAction() {
        this.gameState.timeBanksUsedThisAction = 0;
    }

    getPots() {
        return this.gameState.pots;
    }

    setPots(pots: Pot[]) {
        this.gameState.pots = pots;
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
        this.gameState.pots = this.getPots().filter((pot) => pot != poppedPot);
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
        this.gameState.handWinners.add(playerUUID);
    }

    getSB() {
        return this.gameState.gameParameters.smallBlind;
    }

    getBB() {
        return this.gameState.gameParameters.bigBlind;
    }

    getTimeBankValue() {
        return this.gameState.gameParameters.timeBankTime * 1000;
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

    getPlayerPositionMap(): Map<PlayerUUID, PlayerPosition> {
        const numPlayers = this.getPlayersDealtIn().length;
        const positions = PLAYER_POSITIONS_BY_HEADCOUNT[numPlayers];
        const playerPositionMap: Map<PlayerUUID, PlayerPosition> = new Map();
        const seats = this.getSeats().filter(([seatNumber, uuid]) => this.wasPlayerDealtIn(uuid));

        let currentPlayerUUID = this.getDealerUUID();
        let currentSeatNumber = seats.findIndex(([seatNumber, uuid]) => uuid === currentPlayerUUID);
        let positionIndex = 0;

        while (positionIndex < numPlayers) {
            playerPositionMap.set(currentPlayerUUID, positions[positionIndex]);
            positionIndex += 1;
            currentSeatNumber = (currentSeatNumber + 1) % seats.length;
            currentPlayerUUID = seats[currentSeatNumber][1];
        }
        return playerPositionMap;
    }

    getSeatNumberRelativeToDealer(playerUUID: PlayerUUID) {
        const numPlayers = this.getPlayersDealtIn().length;
        return (
            this.getPlayer(playerUUID).seatNumber +
            ((numPlayers - this.getPlayer(this.getDealerUUID()).seatNumber) % numPlayers)
        );
    }

    comparePositions(playerA: PlayerUUID, playerB: PlayerUUID) {
        const posA = this.getSeatNumberRelativeToDealer(playerA);
        const posB = this.getSeatNumberRelativeToDealer(playerB);

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

    setShouldDealNextHand(shouldDealNextHand: boolean) {
        this.gameState.shouldDealNextHand = shouldDealNextHand;
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

    // Used to display message to users that game will change
    gameParametersWillChangeAfterHand(): boolean {
        return this.getQueuedServerActions().some((action) => action.actionType === ClientActionType.SETGAMEPARAMETERS);
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

    dealCardsToBoard(amount: number): Card[] {
        const newCards = [...Array(amount).keys()].map((_) => this.drawCard());
        this.gameState.board.push(...newCards);
        return newCards;
    }

    dealCardsToPlayer(amount: number, playerUUID: PlayerUUID) {
        const newCards = [...Array(amount).keys()].map((_) => this.drawCard());
        this.getPlayer(playerUUID).holeCards = newCards;
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
            this.gameState.activeConnections.set(clientUUID, newClient);
            this.ledgerService.initRow(clientUUID);
        }
    }

    initAdmin(clientUUID: ClientUUID) {
        this.gameState.admin = clientUUID;
    }

    getAdminUUID() {
        return this.gameState.admin;
    }

    @debugFunc()
    initGame(gameParameters: GameParameters) {
        const newGame = {
            ...getCleanGameState(),
            table: this.initTable(),
            gameParameters: gameParameters,
        };
        this.gameState = newGame;
    }

    initTable() {
        return {
            activeConnections: new Map(),
            admin: '',
        };
    }

    initializeNewDeck() {
        this.gameState.deck = this.deckService.newDeck();
    }

    /* Updaters */

    updateGameParameters(gameParameters: GameParameters) {
        this.gameState.gameParameters = gameParameters;
    }

    queueAction(queuedServerAction: QueuedServerAction) {
        this.gameState.queuedServerActions.push(queuedServerAction);
    }

    getQueuedServerActions(): QueuedServerAction[] {
        return this.gameState.queuedServerActions;
    }

    clearQueuedServerActions() {
        this.gameState.queuedServerActions = [];
    }

    /* Player operations */

    associateClientAndPlayer(clientUUID: ClientUUID, playerUUID: PlayerUUID): ConnectedClient {
        const connectedClient = this.getConnectedClient(clientUUID);
        connectedClient.playerUUID = playerUUID;
        return connectedClient;
    }

    removePlayerFromGame(playerUUID: PlayerUUID) {
        if (this.isPlayerInHand(playerUUID)) {
            this.queueAction({
                actionType: ClientActionType.BOOTPLAYER,
                args: [playerUUID],
            });
            this.setPlayerQuitting(playerUUID, true);
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
        delete this.gameState.players[playerUUID];
    }

    // TODO if you need to perform more operations like this, you need to create helpers
    deassociateClientAndPlayer(playerUUID: PlayerUUID) {
        const clientUUID = this.getClientByPlayerUUID(playerUUID);
        if (!clientUUID) {
            throw Error('deassociateClientAndPlayer called with a player that doesnt have a client.');
        }
        this.gameState.activeConnections.set(clientUUID, this.createConnectedClient(clientUUID));
    }

    addNewPlayerToGame(clientUUID: ClientUUID, request: JoinTableRequest) {
        const { name, buyin, avatarKey } = request;
        const player = this.createNewPlayer(name, buyin, avatarKey);

        // TODO remove temporary logic
        // this deletes previous player association and replaces it
        // with new one
        const client = this.getConnectedClient(clientUUID);
        if (client.playerUUID) {
            this.removePlayerFromPlayers(client.playerUUID);
        }
        // -----

        const associatedClient = this.associateClientAndPlayer(clientUUID, player.uuid);
        this.updatePlayer(player.uuid, player, true);
        this.gameState.activeConnections.set(associatedClient.uuid, associatedClient);

        this.ledgerService.addAlias(clientUUID, name);
        this.ledgerService.addBuyin(clientUUID, buyin);
    }

    setWillPlayerStraddle(playerUUID: PlayerUUID, willStraddle: boolean) {
        this.getPlayer(playerUUID).willStraddle = willStraddle;
    }

    sitDownPlayer(playerUUID: PlayerUUID, seatNumber: number) {
        const player = this.getPlayer(playerUUID);
        player.sitting = true;
        player.sittingOut = false;
        player.seatNumber = seatNumber;
    }

    standUpPlayer(playerUUID: PlayerUUID) {
        const player = this.getPlayer(playerUUID);
        player.sitting = false;
        player.sittingOut = false;
        player.seatNumber = -1;
        const clientUUID = this.getClientByPlayerUUID(playerUUID);
        this.ledgerService.addWalkaway(clientUUID, player.chips);
    }

    sitOutPlayer(playerUUID: PlayerUUID) {
        this.getPlayer(playerUUID).sittingOut = true;
    }

    sitInPlayer(playerUUID: PlayerUUID) {
        this.getPlayer(playerUUID).sittingOut = false;
    }

    canPlayerShowCards(playerUUID: PlayerUUID) {
        const { canShowHeadsUp } = this.getGameParameters();

        // obiviously never let player show cards who wasn't dealt cards
        if (!this.wasPlayerDealtIn(playerUUID)) {
            return false;
        }
        const numPlayersInHand = this.getPlayersInHand().length;
        return (
            // everyone can show if one player left in hand
            numPlayersInHand === 1 ||
            // if canShowHeadsUp then players who are heads up can show anytime
            (canShowHeadsUp && this.isPlayerInHand(playerUUID) && numPlayersInHand === 2) ||
            // all players can show after betting finishes if we are on river
            (this.getGameStage() === GameStage.FINISH_BETTING_ROUND &&
                this.getBettingRoundStage() === BettingRoundStage.RIVER) ||
            // all players can show in showdown
            this.getGameStage() === GameStage.SHOW_WINNER
        );
    }

    setPlayerCardVisible(playerUUID: PlayerUUID, matchCard: Card) {
        const player = this.getPlayer(playerUUID);
        this.updatePlayer(playerUUID, {
            holeCards: player.holeCards.map((holeCard) => {
                if (cardsAreEqual(holeCard, matchCard)) {
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
        this.gameState.firstToAct = playerUUID;
    }

    setCurrentPlayerToAct(playerUUID: PlayerUUID) {
        this.gameState.currentPlayerToAct = playerUUID;
    }

    setBettingRoundStage(bettingRoundStage: BettingRoundStage) {
        this.gameState.bettingRoundStage = bettingRoundStage;
    }

    setPlayerLastActionType(playerUUID: PlayerUUID, lastActionType: BettingRoundActionType) {
        this.getPlayer(playerUUID).lastActionType = lastActionType;
    }

    setGameParameters(gameParameters: GameParameters) {
        this.gameState.gameParameters = gameParameters;
    }

    changePlayerName(playerUUID: PlayerUUID, name: string) {
        this.getPlayer(playerUUID).name = name;
        this.ledgerService.addAlias(this.getClientByPlayerUUID(playerUUID), name);
    }

    getLastBettingRoundAction(): BettingRoundAction {
        return this.gameState.lastBettingRoundAction;
    }

    setLastBettingRoundAction(lastBettingRoundAction: BettingRoundAction) {
        this.gameState.lastBettingRoundAction = lastBettingRoundAction;
    }

    getHoleCards(playerUUID: PlayerUUID): ReadonlyArray<Card> {
        return this.getPlayer(playerUUID).holeCards;
    }

    computeBestHandForPlayer(playerUUID: PlayerUUID): Hand {
        const bestHand =
            this.getGameType() === GameType.PLOMAHA
                ? this.handSolverService.computeBestPLOHand(this.getPlayer(playerUUID).holeCards, this.getBoard())
                : this.handSolverService.computeBestNLEHand(this.getPlayer(playerUUID).holeCards, this.getBoard());
        this.getPlayer(playerUUID).bestHand = bestHand;
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

    updatePlayerHandDescription(playerUUID: PlayerUUID) {
        const bestHand = this.computeBestHandForPlayer(playerUUID);
        this.getPlayer(playerUUID).handDescription = this.getStrDescriptionFromHand(bestHand);
    }

    clearPlayerHandDescription(playerUUID: PlayerUUID) {
        this.getPlayer(playerUUID).handDescription = '';
    }

    // removes wanted characters from the description string
    // and in full names of cards
    getStrDescriptionFromHand(hand: Hand): string {
        // K High
        // Two pair, A's & Q's
        // Three of a Kind, 6's
        // Pair, 3's
        // Full House, 5's over 4's
        // Flush, Ah High
        // Straight, 8 High
        let description = hand.descr;
        Object.entries(RankAbbrToFullString).forEach(([abbr, fullStr]) => {
            const regexStr = `${abbr}(h|d|s|c)|${abbr}(?!ind)`; // match abbr with flush suit (h|d|s|c) that follows OR match abbr by itself but not if 'ind' follows
            const regex = new RegExp(regexStr, 'g');
            description = description.replace(regex, fullStr);
        });
        description = description.replace(/'s/g, 's').replace(/Sixs/g, 'Sixes');

        return description;
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

    getPlayerChips(playerUUID: PlayerUUID) {
        return this.getPlayer(playerUUID).chips;
    }

    getPlayerBetAmount(playerUUID: PlayerUUID) {
        return this.getPlayer(playerUUID).betAmount;
    }

    setPlayerBetAmount(playerUUID: PlayerUUID, betAmount: number) {
        if (betAmount > this.getPlayerChips(playerUUID)) {
            throw Error(
                `Player: ${playerUUID} betamount: ${betAmount} is larger than their number of chips: ${this.getPlayerChips(
                    playerUUID,
                )}.` + `GameState: ${getLoggableGameState(this.gameState)}`,
            );
        }
        this.getPlayer(playerUUID).betAmount = betAmount;
    }

    getPlayerChipsAtStartOfHand(playerUUID: PlayerUUID): number {
        return this.getPlayer(playerUUID).chipsAtStartOfHand;
    }

    setPlayerChipDelta(playerUUID: PlayerUUID, chipDelta: number) {
        this.getPlayer(playerUUID).chipDelta = chipDelta;
    }

    clearWinnersAndDeltas() {
        this.updatePlayers((player) => ({
            winner: false,
            chipDelta: 0,
        }));
    }

    recordPlayerChipsAtStartOfHand() {
        this.forEveryPlayer((player) => {
            player.chipsAtStartOfHand = player.chips;
        });
    }

    clearStateOfHandInfo() {
        this.updatePlayers((_) => ({
            lastActionType: BettingRoundActionType.NOT_IN_HAND,
            holeCards: [],
            handDescription: '',
            bestHand: null,
            winner: false,
            betAmount: 0,
            timeBanksUsedThisAction: 0,
            chipDelta: 0,
            chipsAtStartOfHand: 0,
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
        this.gameState.currentPlayerToAct = makeBlankUUID();
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
        return this.getPlayerChips(playerUUID) === this.getPlayerBetAmount(playerUUID);
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

    getWinningHandDescription(): string | undefined {
        const winners = this.getWinners();
        return winners.length ? this.getStrDescriptionFromHand(this.getPlayerBestHand(winners[0])) : undefined;
    }

    setIsPlayerWinner(playerUUID: PlayerUUID, isWinner: boolean) {
        this.getPlayer(playerUUID).winner = isWinner;
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
        this.gameState.bettingRoundStage = this.getNextBettingRoundStage();
    }

    clearBettingRoundStage() {
        this.gameState.bettingRoundStage = BettingRoundStage.WAITING;
    }
}
