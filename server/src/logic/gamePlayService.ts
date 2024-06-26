import { Service } from 'typedi';
import { GameStateManager } from '../state/gameStateManager';
import { GameType, GameParameters } from '../../../ui/src/shared/models/game/game';

import { HandSolverService } from '../cards/handSolverService';
import {
    BettingRoundAction,
    BettingRoundActionType,
    BettingRoundStage,
    CHECK_ACTION,
    Pot,
} from '../../../ui/src/shared/models/game/betting';
import { AudioService } from '../state/audioService';
import { AnimationService } from '../state/animationService';

import { getLoggableGameState, getEpochTimeMs } from '../../../ui/src/shared/util/util';
import { ValidationService } from './validationService';
import { Hand, Card } from '../../../ui/src/shared/models/game/cards';
import { LedgerService } from '../stats/ledgerService';
import { logger } from '../logger';
import { PlayerUUID, makeBlankUUID } from '../../../ui/src/shared/models/system/uuid';
import { GameInstanceLogService } from '../stats/gameInstanceLogService';
import { PlayerSeat } from '../../../ui/src/shared/models/state/gameState';
import { ClientActionType } from '../../../ui/src/shared/models/api/api';
import { ChatService } from '../state/chatService';
import { TimerManager } from '../state/timerManager';
import { Context } from '../state/context';
import {
    createTimeBankReplenishEvent,
    createIncrementBlindsScheduleEvent,
    Event,
} from '../../../ui/src/shared/models/api/api';
import { assert } from 'console';

@Service()
export class GamePlayService {
    private processEventCallback: (event: Event) => void;

    constructor(
        private readonly gsm: GameStateManager,
        private readonly handSolverService: HandSolverService,
        private readonly audioService: AudioService,
        private readonly animationService: AnimationService,
        private readonly ledgerService: LedgerService,
        private readonly validationService: ValidationService,
        private readonly gameInstanceLogService: GameInstanceLogService,
        private readonly chatService: ChatService,
        private readonly timerManager: TimerManager,
        private readonly context: Context,
    ) {}

    setProcessEventCallback(fn: (event: Event) => void) {
        this.processEventCallback = fn;
    }

    startGame() {
        this.gsm.setShouldDealNextHand(true);
        if (this.gsm.getTimeGameStarted() === 0) {
            this.gsm.setTimeGameStarted(getEpochTimeMs());
            this.createTimeBankReplenishTimer();
            if (this.gsm.isThereABlindsSchedule()) {
                this.createBlindScheduleTimer();
                const currentLevel = this.gsm.getCurrentBlindsLevel();
                if (currentLevel) {
                    this.gsm.setSmallBlind(currentLevel.smallBlind);
                    this.gsm.setBigBlind(currentLevel.bigBlind);
                }
            }
        } else {
            this.startGameTimers();
        }
    }

    pauseGameIfNeeded() {
        if (!this.gsm.canDealNextHand()) {
            this.pauseGameTimers();
            this.gsm.setShouldDealNextHand(false);
        }
    }

    createTimeBankReplenishTimer() {
        const gameInstanceUUID = this.context.getGameInstanceUUID();
        this.timerManager.setTimeBankReplenishInterval(() => {
            this.processEventCallback(createTimeBankReplenishEvent(gameInstanceUUID));
        }, this.gsm.getTimeBankReplenishIntervalMinutes() * 60 * 1000);
    }

    createBlindScheduleTimer() {
        const gameInstanceUUID = this.context.getGameInstanceUUID();
        this.timerManager.setIncrementBlindsScheduleInterval(() => {
            this.processEventCallback(createIncrementBlindsScheduleEvent(gameInstanceUUID));
        }, this.gsm.getBlindsIntervalMinutes() * 60 * 1000);
    }

    pauseGameTimers() {
        this.timerManager.pauseIncrementBlindsScheduleInterval();
        this.timerManager.pauseTimeBankReplenishTimer();
    }

    startGameTimers() {
        this.timerManager.startIncrementBlindsScheduleInterval();
        this.timerManager.startTimeBankReplenishTimer();
    }

    setGameParameters(gameParameters: GameParameters) {
        if (!this.gsm.isGameNotInProgressOrInPostHandCleanUp()) {
            this.gsm.queueAction({
                actionType: ClientActionType.SETGAMEPARAMETERS,
                args: [gameParameters],
            });
        } else {
            const curTimeBankReplenishIntervalMinutes = this.gsm.getTimeBankReplenishIntervalMinutes();
            const curBlindsIntervalMinutes = this.gsm.getBlindsIntervalMinutes();
            this.gsm.setGameParameters(gameParameters);

            if (gameParameters.timeBankReplenishIntervalMinutes !== curTimeBankReplenishIntervalMinutes) {
                this.createTimeBankReplenishTimer();
                if (!this.gsm.isGameInProgress()) this.timerManager.pauseTimeBankReplenishTimer();
            }
            if (gameParameters.blindsIntervalMinutes !== curBlindsIntervalMinutes) {
                this.createBlindScheduleTimer();
                if (!this.gsm.isGameInProgress()) this.timerManager.pauseIncrementBlindsScheduleInterval();
            }
        }
    }

    computeAndSetCurrentPlayerToAct() {
        this.gsm.updateCurrentPlayerSeatToAct();
        this.audioService.playHeroTurnToActSFX(this.gsm.getCurrentPlayerSeatToAct().playerUUID);
    }

    setTimeCurrentPlayerTurnStarted() {
        if (this.gsm.getTimeBanksUsedThisAction() === 0) {
            this.gsm.setTimeCurrentPlayerTurnStarted(Date.now());
        }
    }

    computeTimeRemainingToAct() {
        const timeRemaining =
            this.gsm.getTimeToAct() +
            this.gsm.getSumTimeBankValueThisAction() -
            this.gsm.getCurrentPlayerTurnElapsedTime();
        return timeRemaining;
    }

    timeOutPlayer() {
        const playerSeat = this.gsm.getCurrentPlayerSeatToAct();
        if (!playerSeat || !playerSeat.playerUUID) {
            logger.error(
                `timeOutPlayer was called and there is no currentPlayerSeatToAct. GameState:` +
                    `${getLoggableGameState(this.gsm.getGameState())}`,
            );
            return;
        }
        const clientUUID = this.gsm.getClientByPlayerUUID(playerSeat.playerUUID);
        const error = this.validationService.validateBettingRoundAction(clientUUID, CHECK_ACTION);
        if (!error) {
            this.performBettingRoundAction({ type: BettingRoundActionType.CHECK, amount: 0 });
        } else {
            this.performBettingRoundAction({ type: BettingRoundActionType.FOLD, amount: 0 });
            this.gsm.sitOutPlayer(playerSeat.playerUUID);
        }
    }

    updatePlayersBestHands() {
        this.gsm.forEveryPlayerUUID((playerUUID) => {
            this.gsm.isPlayerInHand(playerUUID)
                ? this.gsm.updatePlayerBestHand(playerUUID)
                : this.gsm.clearPlayerBestHand(playerUUID);
        });
    }

    startOfBettingRound() {
        this.updatePlayersBestHands();
    }

    endOfBettingRound() {
        this.gsm.setMinRaiseDiff(this.gsm.getBB());
        this.gsm.setPreviousRaise(0);
        this.gsm.updateGameState({
            lastFullRaiserUUID: makeBlankUUID(),
        });
    }

    resetBettingRoundActions() {
        this.gsm.forEveryPlayerUUID((playerUUID) => {
            if (this.gsm.isPlayerInHand(playerUUID) && !this.gsm.hasPlayerPutAllChipsInThePot(playerUUID)) {
                this.gsm.setPlayerLastActionType(playerUUID, BettingRoundActionType.WAITING_TO_ACT);
                this.gsm.setPlayerBetAmount(playerUUID, 0);
            }
        });
    }

    useTimeBankAction() {
        const currentPlayerSeatToAct = this.gsm.getCurrentPlayerSeatToAct();
        this.gsm.incrementTimeBanksUsedThisAction();
        this.gsm.decrementTimeBanksLeft(currentPlayerSeatToAct.playerUUID);
        this.animationService.setPlayerUseTimeBankAnimation(currentPlayerSeatToAct.playerUUID);
    }

    /* Betting Round Actions */
    performBettingRoundAction(action: BettingRoundAction) {
        this.gsm.setLastBettingRoundAction(action);
        let betAmount = action.amount;
        switch (action.type) {
            case BettingRoundActionType.CHECK: {
                this.check();
                break;
            }

            case BettingRoundActionType.FOLD: {
                this.fold();
                break;
            }

            /** bet and callBet have logic that authoritatively determine the betAmounts. */
            case BettingRoundActionType.BET: {
                betAmount = this.bet(action.amount);
                break;
            }

            case BettingRoundActionType.CALL: {
                betAmount = this.callBet();
                break;
            }
        }

        this.gameInstanceLogService.pushBetAction(
            this.gsm.getCurrentPlayerSeatToAct().playerUUID,
            { type: action.type, amount: betAmount },
            getEpochTimeMs() - this.gsm.getTimeCurrentPlayerTurnStarted(),
        );
    }

    // if the validation layer takes care of most things,
    // then its possible to get rid of these methods, and of
    // the CHECK_ACTION / FOLD_ACTION constants
    check() {
        this.audioService.playCheckSFX();
        this.gsm.setPlayerLastActionType(this.gsm.getCurrentPlayerSeatToAct().playerUUID, BettingRoundActionType.CHECK);
    }

    fold() {
        this.audioService.playFoldSFX();
        this.gsm.setPlayerLastActionType(this.gsm.getCurrentPlayerSeatToAct().playerUUID, BettingRoundActionType.FOLD);

        // TODO only if player is facing bet
    }

    bet(betAmount: number, playerPlacingBlindBetUUID?: PlayerUUID) {
        const playerPlacingBet = playerPlacingBlindBetUUID
            ? playerPlacingBlindBetUUID
            : this.gsm.getCurrentPlayerSeatToAct().playerUUID;

        // It is possible that this bet method is called with a betAmount greater
        // than the amount of chips the player has (for example, player is placing
        // a $2 BB but they only have $1). To simplify app logic this is handled here.
        const chips = this.gsm.getPlayerChips(playerPlacingBet);
        const actualBetAmount = betAmount > chips ? chips : betAmount;
        this.gsm.setPlayerBetAmount(playerPlacingBet, actualBetAmount);
        const isPlayerAllIn = this.gsm.hasPlayerPutAllChipsInThePot(playerPlacingBet);

        // if we're placing blinds and not all in, set the last action to place blind
        this.gsm.setPlayerLastActionType(
            playerPlacingBet,
            isPlayerAllIn
                ? BettingRoundActionType.ALL_IN
                : playerPlacingBlindBetUUID
                ? BettingRoundActionType.PLACE_BLIND
                : BettingRoundActionType.BET,
        );

        const previousRaise = this.gsm.getPreviousRaise();
        const minRaiseDiff = this.gsm.getMinRaiseDiff();
        const raisingBy = actualBetAmount - previousRaise;

        // this is a full raise
        if (raisingBy >= minRaiseDiff) {
            this.gsm.setMinRaiseDiff(Math.max(this.gsm.getBB(), actualBetAmount - previousRaise));
            // record last full raiser if it is not a blind bet
            if (!playerPlacingBlindBetUUID) {
                this.gsm.updateGameState({
                    lastFullRaiserUUID: playerPlacingBet,
                });
            }
        }
        this.gsm.setPreviousRaise(Math.max(this.gsm.getBB(), actualBetAmount));

        // record last aggressor
        this.gsm.updateGameState({
            lastAggressorUUID: playerPlacingBet,
        });

        this.audioService.playBetSFX();

        return actualBetAmount;
    }

    callBet() {
        this.audioService.playCallSFX();
        const currentPlayerToActUUID = this.gsm.getCurrentPlayerSeatToAct().playerUUID;

        // If player is facing a bet that is larger than their stack, they can CALL and go all-in.
        // TODO find the cleanest way to do this. Should that logic be handled in setPlayerBetAmount, or here?
        const callAmount = this.gsm.computeCallAmount(currentPlayerToActUUID);
        this.gsm.setPlayerBetAmount(currentPlayerToActUUID, callAmount);

        const isPlayerAllIn = this.gsm.hasPlayerPutAllChipsInThePot(currentPlayerToActUUID);
        this.gsm.setPlayerLastActionType(
            currentPlayerToActUUID,
            isPlayerAllIn ? BettingRoundActionType.ALL_IN : BettingRoundActionType.CALL,
        );

        return callAmount;
    }

    initializeNewHand() {
        this.gsm.incrementHandNumber();
        this.gsm.initializeNewDeck();
        this.gsm.incrementDealerSeatNumber();
        this.gsm.generateTableSeatsAndPlayerPositionMap();

        this.gsm.recordPlayerChipsAtStartOfHand();
        this.placeBlinds();
        this.gameInstanceLogService.initNewHand();
    }

    placeBlinds() {
        const numPlayersReadyToPlay = this.gsm.getPlayersReadyToPlay().length;
        const dealerSeat = this.gsm.getDealerSeat();
        const SB = this.gsm.getSB();
        const BB = this.gsm.getBB();

        const smallBlindSeat = numPlayersReadyToPlay === 2 ? dealerSeat : this.gsm.getNextPlayerSeatReadyToPlay(0);
        const bigBlindSeat = this.gsm.getNextPlayerSeatReadyToPlay(numPlayersReadyToPlay === 2 ? 0 : 1);
        const straddleSeat = this.gsm.getNextPlayerSeatReadyToPlay(2);

        const willPlayerStraddle = this.gsm.willPlayerStraddle(straddleSeat.playerUUID);
        const placeStraddle = willPlayerStraddle && numPlayersReadyToPlay > 2;

        // if you are sitting out and in between the prevBigBlindUUID & bigBlindUUID
        // then you missed a big blind and must most a big blind when you rejoin
        const prevBigBlindSeat = this.gsm.getPrevBigBlindSeat();
        if (prevBigBlindSeat) {
            this.gsm.getPlayersInBetween(prevBigBlindSeat, bigBlindSeat).forEach((playerUUID) => {
                if (this.gsm.getPlayer(playerUUID).sittingOut) this.gsm.setPlayerWillPostBlind(playerUUID, true);
            });
        }
        // this.bet() is a setter, not adder, so we proceed by placing smallest blinds first
        // and larger blinds will then take priority as desired.
        this.bet(SB, smallBlindSeat.playerUUID);

        this.gsm.getPlayersThatWillPostBlind().forEach((player) => {
            if (!player.sittingOut) {
                this.bet(BB, player.uuid);
                this.gsm.setPlayerWillPostBlind(player.uuid, false);
            }
        });

        this.bet(BB, bigBlindSeat.playerUUID);

        // TODO Should a player be allowed to straddle if they have less than the straddle amount?
        // i.e. in 1/2 they have 3 chips so they are put all-in by straddling "4"
        if (placeStraddle) {
            this.bet(BB * 2, straddleSeat.playerUUID);
        }

        this.gsm.setSmallBlindSeat(smallBlindSeat);
        this.gsm.setBigBlindSeat(bigBlindSeat);
        this.gsm.setStraddleSeat(placeStraddle ? straddleSeat : undefined);
    }

    /** Assumes that players have been dealt in already. */
    setFirstToActAtStartOfBettingRound() {
        const bigBlindSeat = this.gsm.getBigBlindSeat();
        const dealerSeat = this.gsm.getDealerSeat();
        const straddleSeat = this.gsm.getStraddleSeat();
        const headsUp = this.gsm.getSeatsDealtIn().length === 2;
        let firstToAct: PlayerSeat = null;

        if (this.gsm.getBettingRoundStage() === BettingRoundStage.PREFLOP) {
            if (headsUp) {
                firstToAct = dealerSeat;
            } else if (straddleSeat) {
                firstToAct = this.gsm.getNextPlayerSeatEligibleToAct(3);
            } else {
                firstToAct = this.gsm.getNextPlayerSeatEligibleToAct(2);
            }
        } else {
            firstToAct = this.gsm.getNextPlayerSeatEligibleToAct(0);
        }
        if (this.gsm.hasPlayerPutAllChipsInThePot(firstToAct.playerUUID)) {
            firstToAct = this.gsm.getNextPlayerSeatEligibleToAct(firstToAct.positionIndex);
        }

        this.gsm.setFirstSeatToAct(firstToAct);
    }

    dealHoleCards(playerUUID: PlayerUUID) {
        const gameType = this.gsm.getGameType();
        switch (gameType) {
            case GameType.NLHOLDEM: {
                this.gsm.dealCardsToPlayer(2, playerUUID);
                break;
            }
            case GameType.PLOMAHA: {
                this.gsm.dealCardsToPlayer(4, playerUUID);
                break;
            }
            default: {
                throw Error(`GameType: ${gameType} is not implemented yet.`);
            }
        }
    }

    initializeBettingRound() {
        const bettingRoundStage = this.gsm.getBettingRoundStage();
        this.gameInstanceLogService.updateLastBettingRoundStage();
        this.gameInstanceLogService.initNewBettingRoundLog();

        switch (bettingRoundStage) {
            case BettingRoundStage.PREFLOP: {
                this.animationService.setDealCardsAnimation();
                this.gsm.getSeatsDealtIn().forEach((playerSeat) => {
                    const { playerUUID, seatNumber } = playerSeat;

                    if (
                        this.gsm.getPlayerSeatNumber(playerUUID) === seatNumber &&
                        this.gsm.isPlayerReadyToPlay(playerUUID)
                    ) {
                        this.dealHoleCards(playerUUID);
                        this.ledgerService.incrementHandsDealtIn(this.gsm.getClientByPlayerUUID(playerUUID));
                        this.gameInstanceLogService.updatePlayerCards(playerUUID);
                    }
                });
                this.gameInstanceLogService.updatePlayerPositions();
                break;
            }

            case BettingRoundStage.FLOP: {
                const cards = this.gsm.dealCardsToBoard(3);
                this.gameInstanceLogService.updateCardsDealtThisBettingRound(cards);
                this.gsm.forEveryPlayerUUID((playerUUID) => {
                    if (this.gsm.isPlayerInHand(playerUUID)) {
                        this.ledgerService.incrementFlopsSeen(this.gsm.getClientByPlayerUUID(playerUUID));
                    }
                });
                this.audioService.playFlopSFX();
                break;
            }

            case BettingRoundStage.TURN: {
                const cards = this.gsm.dealCardsToBoard(1);
                this.gameInstanceLogService.updateCardsDealtThisBettingRound(cards);
                this.audioService.playTurnRiverSFX();
                break;
            }

            case BettingRoundStage.RIVER: {
                const cards = this.gsm.dealCardsToBoard(1);
                this.gameInstanceLogService.updateCardsDealtThisBettingRound(cards);
                this.audioService.playTurnRiverSFX();
                break;
            }

            default: {
                throw Error(
                    `Shouldn't be reaching default switch path in gamePlayService.dealCards.` +
                        ` This is a bug. ${getLoggableGameState(this.gsm.getGameState())}`,
                );
            }
        }
    }

    showDown() {
        const playersHands: [PlayerUUID, Hand][] = this.gsm
            .getPlayersInHand()
            .map((playerUUID) => [playerUUID, this.gsm.getPlayerBestHand(playerUUID)]);

        const pot = this.gsm.popPot();

        this.gameInstanceLogService.initializePotSummary(pot.value);

        const eligiblePlayers: [PlayerUUID, Hand][] = playersHands.filter(([uuid, hand]) =>
            pot.contestors.includes(uuid),
        );
        const winningHands: Hand[] = this.handSolverService.getWinningHands(
            eligiblePlayers.map(([uuid, hand]) => hand),
        );
        const winningPlayers: PlayerUUID[] = eligiblePlayers
            .filter(([uuid, hand]) => winningHands.includes(hand))
            .map(([uuid, hand]) => uuid);

        /**
         *  Split chips evenly amongst winners, distributing odd chips by early position
         *  Example: 3-way pot of 14 would get first get split into 4, 4, 4.
         *  There are 2 odd chips left:
         *      earliest position gets one
         *      second earliest gets the second one
         *  Final split ends up being 5, 5, 4
         */

        const numWinners = winningPlayers.length;
        const evenSplit = Math.floor(pot.value / numWinners);
        let oddChips = pot.value - evenSplit * numWinners;

        // sort winning players by position
        winningPlayers.sort((playerA, playerB) => this.gsm.comparePositions(playerA, playerB));
        const amountsWon: { [uuid: string]: number } = Object.fromEntries(
            winningPlayers.map((playerUUID) => {
                const amount = oddChips > 0 ? evenSplit + 1 : evenSplit;
                oddChips -= 1;
                return [playerUUID, amount];
            }),
        );

        // show cards
        if (!this.gsm.hasEveryoneButOnePlayerFolded()) {
            // always show winning players hands
            winningPlayers.map((wp) => {
                this.setPlayerCardsAllVisible(wp);
                this.gsm.setPlayerCannotHideCards(wp, true);
            });

            // show banner for winning hands, any winning hand will do
            this.gsm.setWinningHand(winningHands[0]);

            // sort eligible players by position
            eligiblePlayers.sort(([playerA, _], [playerB, __]) => this.gsm.comparePositions(playerA, playerB));

            // choose starting player
            // start with last aggressor if eligible
            const lastAggressorUUID = this.gsm.getLastAggressorUUID();
            let startIndex = eligiblePlayers.findIndex(([p, _]) => p === lastAggressorUUID);
            if (startIndex === -1) {
                startIndex = 0; // if last aggressor is not eligible then start at beginning
            }

            // start with startingPlayer continue left, circularly
            // only show if your hand is the best seen thus far, break if we hit a winning hand
            let [playerToBeatUUID, handToBeatUUID] = eligiblePlayers[startIndex];
            for (let i = startIndex; i < eligiblePlayers.length + startIndex; i++) {
                const [currentPlayerUUID, currentPlayerHand] = eligiblePlayers[i % eligiblePlayers.length];
                if (this.handSolverService.compareHands(handToBeatUUID, currentPlayerHand) <= 0) {
                    this.setPlayerCardsAllVisible(currentPlayerUUID);
                    this.gsm.setPlayerCannotHideCards(currentPlayerUUID, true);
                    [playerToBeatUUID, handToBeatUUID] = [currentPlayerUUID, currentPlayerHand];
                }
                this.gameInstanceLogService.addPlayerHandToPotSummary(currentPlayerUUID, currentPlayerHand.descr);
            }
        }

        this.gsm.clearWinnersAndDeltas();

        winningPlayers.forEach((playerUUID) => {
            const amountWon = amountsWon[playerUUID];
            this.audioService.playHeroWinSFX(playerUUID);
            this.gsm.addPlayerChips(playerUUID, amountWon);
            this.gsm.setIsPlayerWinner(playerUUID, true);
            this.gsm.setPlayerChipDelta(playerUUID, amountWon);
            this.gsm.addHandWinner(playerUUID);
            this.gameInstanceLogService.addWinnerToPotSummary(playerUUID, amountWon);
        });
        eligiblePlayers.forEach(([playerUUID, _]) => {
            if (!Object.values(winningPlayers).includes(playerUUID)) {
                this.audioService.playVillianWinSFX(playerUUID);
            }
        });
    }

    setPlayerCardsAllVisible(playerUUID: PlayerUUID) {
        this.gsm.setPlayerAllCardsVisibility(playerUUID, true);
        this.gameInstanceLogService.updatePlayerCards(playerUUID);
    }

    setPlayerCardVisible(playerUUID: PlayerUUID, card: Card) {
        this.gsm.setPlayerCardVisibility(playerUUID, card, true);
        this.gameInstanceLogService.updatePlayerCards(playerUUID);
    }

    setPlayerCardNotVisible(playerUUID: PlayerUUID, card: Card) {
        this.gsm.setPlayerCardVisibility(playerUUID, card, false);
        this.gameInstanceLogService.updatePlayerCards(playerUUID);
    }

    // TODO differentiate between chip delta when player is winning a pot, vs chip delta for an entire hand.
    // Do this by picking a clear name for both. (i.e. chipsGained and chipDelta)
    updatePostHandChipDeltas() {
        this.gsm
            .filterPlayerUUIDs((playerUUID) => this.gsm.wasPlayerDealtIn(playerUUID))
            .forEach((playerUUID) => {
                const delta = this.gsm.getPlayerChips(playerUUID) - this.gsm.getPlayerChipsAtStartOfHand(playerUUID);
                this.gameInstanceLogService.updatePlayerChipDelta(playerUUID, delta);
            });
    }

    ejectStackedPlayers() {
        this.gsm.forEveryPlayerUUID((playerUUID) => {
            if (this.gsm.getPlayerChips(playerUUID) === 0) {
                this.gsm.sitOutPlayer(playerUUID);
            }
        });
    }

    placeBetsInPot() {
        let playerBets: [number, PlayerUUID][] = Object.entries(this.gsm.getPlayers()).map(([uuid, player]) => [
            player.betAmount,
            player.uuid,
        ]);

        // TODO see if you can make this more functional style
        const pots: Pot[] = [];
        while (playerBets.length > 0) {
            const minimumBet: number = playerBets.reduce(
                (prev: number, [betAmount, uuid]) => (betAmount < prev ? betAmount : prev),
                playerBets[0][0],
            );

            const pot: Pot = {
                value: minimumBet * playerBets.length,
                contestors: playerBets.map(([betAmount, uuid]) => uuid).sort(),
            };

            pots.push(pot);

            // TODO why is the cast necessary? compiler errors without it
            playerBets = playerBets
                .map(([betAmount, uuid]) => [betAmount - minimumBet, uuid] as [number, PlayerUUID])
                .filter(([betAmount, uuid]) => betAmount > 0);
        }

        // TODO can there ever be more than one uncalled bet? idts
        const gamePots: Pot[] = [];
        const uncalledBets: Pot[] = [];
        pots.forEach((pot) => (pot.contestors.length === 1 ? uncalledBets.push(pot) : gamePots.push(pot)));

        uncalledBets.forEach((pot) => {
            const playerUUID = pot.contestors[0];
            const uncalledBet = pot.value;
            this.gsm.setPlayerBetAmount(playerUUID, this.gsm.getPlayerBetAmount(playerUUID) - uncalledBet);
        });

        // remove folded players from all pots
        const foldedPlayersRemovedPots: Pot[] = [...this.gsm.getPots(), ...gamePots].map((pot) => ({
            value: pot.value,
            contestors: pot.contestors.filter((playerUUID) => this.gsm.isPlayerInHand(playerUUID)),
        }));

        // coalesce the pots by contestors
        const potsByContestors = new Map<string, Pot[]>();
        foldedPlayersRemovedPots.forEach((pot) => {
            const contestors = String(pot.contestors);
            const pots = potsByContestors.get(contestors);
            if (!pots) {
                potsByContestors.set(contestors, [pot]);
            } else {
                potsByContestors.set(contestors, [...pots, pot]);
            }
        });

        const coalescedPots: Pot[] = [...potsByContestors.entries()].map(([contestorsStr, pots]) => ({
            value: pots.reduce((sum, pot) => pot.value + sum, 0),
            contestors: contestorsStr.split(',').map((contestor) => contestor as PlayerUUID),
        }));

        this.gsm.setPots(coalescedPots);

        // update players chip counts
        this.gsm.forEveryPlayerUUID((playerUUID) => {
            this.gsm.subtractBetAmountFromChips(playerUUID);
            this.gsm.setPlayerBetAmount(playerUUID, 0);
        });
    }

    updateIsAllInRunOut() {
        if (this.gsm.isAllInRunOut()) {
            return;
        }
        const [playersAllIn, playersInHand] = [this.gsm.getPlayersPutAllChipsInPot(), this.gsm.getPlayersInHand()];

        // there must be a least two player in the hand and at least one player all in at the minimum
        if (playersAllIn.length < 1 || playersInHand.length < 2) {
            return;
        }

        // if all players are all in then its all in runout
        if (playersAllIn.length === playersInHand.length) {
            this.gsm.setIsAllInRunOut(true);
            return;
        }

        // if one player is not all in
        if (playersAllIn.length >= playersInHand.length - 1) {
            const playersNotAllIn = playersInHand.filter(
                (playerInHandUUID) => !playersAllIn.includes(playerInHandUUID),
            );
            assert(playersNotAllIn.length === 1); // should only every be one player not all in if playersAllIn.length >= playersInHand.length - 1
            const playerNotAllIn = playersNotAllIn[0];
            const isPlayerNotAllInFacingBet = this.gsm.isPlayerFacingBet(playerNotAllIn);
            // if you are not facing a bet and you are the last player not all in then it is a runout
            if (!isPlayerNotAllInFacingBet) {
                this.gsm.setIsAllInRunOut(true);
            }
        }
    }

    flipCardsIfAllInRunOut() {
        if (this.gsm.isAllInRunOut()) {
            this.gsm.getPlayersInHand().forEach((playerUUID) => {
                this.gsm.setPlayerAllCardsVisibility(playerUUID, true);
                this.gsm.setPlayerCannotHideCards(playerUUID, true);
            });
        }
    }

    savePreviousHandInfo() {
        this.gsm.setPrevBigBlindSeat(this.gsm.getBigBlindSeat());
    }

    updateLedgerAfterHand() {
        this.ledgerService.incrementHandsWonForPlayers(
            [...this.gsm.getHandWinners()].map((playerUUID) => this.gsm.getClientByPlayerUUID(playerUUID)),
        );
        this.gsm.forEveryClient((client) => {
            const player = this.gsm.getPlayerByClientUUID(client.uuid);
            if (player) {
                this.ledgerService.setCurrentChips(client.uuid, this.gsm.getPlayerChips(player.uuid));
            }
        });
    }

    buyChipsPlayerAction(playerUUID: PlayerUUID, numChips: number): void {
        if (this.gsm.isPlayerInHand(playerUUID)) {
            this.gsm.queueAction({
                actionType: ClientActionType.BUYCHIPS,
                args: [playerUUID, numChips],
            });
            this.gsm.setPlayerWillAddChips(playerUUID, numChips);
        } else {
            const maxBuyin = this.gsm.getMaxBuyin();
            const currentStack = this.gsm.getPlayerChips(playerUUID);
            const resultingChips = currentStack + numChips > maxBuyin ? maxBuyin : currentStack + numChips;
            const amountAdded = resultingChips - currentStack;
            this.gsm.setPlayerChips(playerUUID, resultingChips);
            if (amountAdded > 0) {
                const clientUUID = this.gsm.getClientByPlayerUUID(playerUUID);
                this.ledgerService.addBuyin(clientUUID, amountAdded);
                this.ledgerService.setCurrentChips(clientUUID, resultingChips);
                this.chatService.announcePlayerBuyin(playerUUID, amountAdded);
            }
            this.gsm.setPlayerWillAddChips(playerUUID, 0);
        }
    }

    // announced indiciates if the server message has be sent
    setChipsAdminAction(playerUUID: PlayerUUID, chipAmt: number, announced: boolean): void {
        const player = this.gsm.getPlayer(playerUUID);
        const originalChips = player.chips;
        const newChips = chipAmt + player.betAmount; // cannot remove live bet
        if (this.gsm.isPlayerInHand(playerUUID)) {
            this.chatService.announceAdminAdjustChips(playerUUID, newChips, originalChips);
            this.gsm.queueAction({
                actionType: ClientActionType.SETCHIPS,
                args: [playerUUID, chipAmt, true],
            });
            this.gsm.setPlayerWillAdminSetChips(playerUUID, newChips);
        } else {
            if (!announced) this.chatService.announceAdminAdjustChips(playerUUID, newChips, originalChips);
            const chipDifference = newChips - originalChips;
            if (chipDifference !== 0) {
                // ledger
                const clientUUID = this.gsm.getClientByPlayerUUID(playerUUID);
                this.ledgerService.addBuyin(clientUUID, chipDifference);
                this.ledgerService.setCurrentChips(clientUUID, newChips);
            }
            this.gsm.setPlayerChips(playerUUID, newChips);
            this.gsm.setPlayerWillAdminSetChips(playerUUID, 0);
        }
    }
}
