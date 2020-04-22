import { Service } from 'typedi';
import { GameStateManager } from './gameStateManager';
import { BettingRoundAction, BettingRoundActionType, BettingRoundStage } from '../../../ui/src/shared/models/game';
import { strict as assert } from 'assert';
import { HandSolverService, Hand } from './handSolverService';
import { TimerManager } from './timerManager';
import { Pot, GameState } from '../../../ui/src/shared/models/gameState';

import { AudioService } from './audioService';

import { printObj, logGameState } from '../../../ui/src/shared/util/util';
import { hasError, ValidationService } from './validationService';

@Service()
export class GamePlayService {
    constructor(
        private readonly gsm: GameStateManager,
        private readonly handSolverService: HandSolverService,
        private readonly timerManager: TimerManager,
        private readonly audioService: AudioService,
        private readonly validationService: ValidationService,
    ) {}

    /* Gameplay functionality */

    // if game is started, and state is waiting, try to initializeGameRound
    // perform this check after every incoming message
    // this way, you don't have to check explicit events
    startGame() {
        this.gsm.updateGameState({ shouldDealNextHand: true });
    }

    // TODO wipe gameplay game state.
    stopGame() {
        this.gsm.updateGameState({ shouldDealNextHand: false });
    }

    // are there only two actions after which a round can start?
    // after sit down and after start game?
    // regardless, better to not tie start game condition check
    // to be dependent on those actions
    startHandIfReady() {
        if (
            // TODO uncomment this once startGame button is added
            this.gsm.shouldDealNextHand() &&
            this.gsm.getBettingRoundStage() === BettingRoundStage.WAITING &&
            this.gsm.getNumberPlayersSitting() >= 2
        ) {
            this.gsm.clearStateOfRoundInfo();
            this.initializeBettingRound();
        }
    }

    setCurrentPlayerToAct(playerUUID: string) {
        // if everyone has gone already, there are no further actors this round, and nobody should be
        // illuminated
        const currentPlayerToAct = this.gsm.haveAllPlayersActed() ? '' : playerUUID;
        this.gsm.setCurrentPlayerToAct(currentPlayerToAct);

        // start the timer if currentPlayerToAct has been set
        if (currentPlayerToAct) {
            console.log(`Setting player timer for playerUUID: ${currentPlayerToAct}`);
            this.gsm.updateGameState({
                timeCurrentPlayerTurnStarted: Date.now(),
            });
            this.timerManager.setPlayerTimer(
                () => this.timeOutPlayer(),
                () => this.gsm.getGameState(),
                this.gsm.getTimeToAct(),
            );
        } else {
            this.timerManager.clearTimer();
        }
    }

    clearCurrentPlayerToAct() {
        this.setCurrentPlayerToAct('');
    }

    timeOutPlayer() {
        const playerUUID = this.gsm.getCurrentPlayerToAct();
        if (!playerUUID) {
            console.log('timeOutPlayer was called and there is no currentPlayerToAct. state:');
            logGameState(this.gsm.getGameState());
            return;
        }
        if (!hasError(this.validationService.validateCheckAction(this.gsm.getClientByPlayerUUID(playerUUID)))) {
            this.check();
        } else {
            this.fold();
        }
        this.triggerPostBettingRoundAction();
    }

    setNextPlayerToAct() {
        this.setCurrentPlayerToAct(this.gsm.getNextPlayerInHandUUID(this.gsm.getCurrentPlayerToAct()));
    }

    updateHandDescriptions() {
        this.gsm.updatePlayers((player) => ({ handDescription: this.gsm.getPlayerHandDescription(player.uuid) }));
    }

    initializeBettingRound() {
        // TODO timer - this seems like it would a good place to handle the timer

        const stage = this.gsm.getBettingRoundStage();
        const playersEligibleToActNext = this.gsm.getPlayersEligibleToActNext();

        /**
         * The betting round is in all-in run out if either everyone has gone all in,
         * or there is one person who is not all in, but they have called the all-in.
         */
        const isAllInRunOut = playersEligibleToActNext.length === 1;

        if (isAllInRunOut) {
            const lonePlayerUUID = playersEligibleToActNext[0];
            this.gsm.setPlayerLastActionType(lonePlayerUUID, BettingRoundActionType.CALL);
        } else {
            this.gsm.updatePlayers((player) =>
                this.gsm.isPlayerEligibleToActNext(player.uuid)
                    ? { lastActionType: BettingRoundActionType.WAITING_TO_ACT, betAmount: 0 }
                    : {},
            );
        }

        this.gsm.updateGameState({ minRaiseDiff: this.gsm.getBB(), previousRaise: 0, partialAllInLeftOver: 0 });

        switch (stage) {
            case BettingRoundStage.WAITING: {
                this.gsm.nextBettingRound();
                // TODO get rid of switch fallthrough
                /* intentional switch-fallthrough */
            }
            case BettingRoundStage.PREFLOP: {
                this.initializePreflop();
                this.audioService.playStartOfHandSFX();
                this.triggerSetFirstToAct();
                break;
            }
            case BettingRoundStage.FLOP: {
                this.initializeFlop();
                // this.audioService.playStartOfBettingRoundSFX();
                this.triggerSetFirstToAct();
                break;
            }
            case BettingRoundStage.TURN: {
                this.initializeTurn();
                // this.audioService.playStartOfBettingRoundSFX();
                this.triggerSetFirstToAct();
                break;
            }
            case BettingRoundStage.RIVER: {
                this.initializeRiver();
                // this.audioService.playStartOfBettingRoundSFX();
                this.triggerSetFirstToAct();
                break;
            }
            case BettingRoundStage.SHOWDOWN: {
                this.showDown();
                // TODO it would be better if this method was kept here,
                // and if you had a global queue system for pushing updates at
                // pre-determined intervals, such that you could just call this function
                // and it would work
                // this.triggerFinishHand();
                break;
            }
        }

        // This code is executed during in all-in run out.
        // That should be the only case when the betting round is over
        // right as it is initialized.
        if (this.gsm.isBettingRoundOver()) {
            this.triggerFinishBettingRound();
        }
    }

    triggerSetFirstToAct() {
        this.timerManager.setTimer(
            () => this.setCurrentPlayerToAct(this.gsm.getFirstToAct()),
            () => this.gsm.getGameState(),
            1000,
        );
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
                this.bet(action.amount);
                break;
            }

            case BettingRoundActionType.CALL: {
                this.callBet();
            }
        }
        this.triggerPostBettingRoundAction();
    }

    triggerPostBettingRoundAction() {
        this.timerManager.setTimer(
            () => this.postBettingRoundAction(),
            () => this.gsm.getGameState(),
            800,
        );
    }

    postBettingRoundAction() {
        if (this.gsm.hasEveryoneButOnePlayerFolded()) {
            this.triggerVictoryByFolding();
        } else if (this.gsm.isBettingRoundOver()) {
            this.triggerFinishBettingRound();
        } else {
            this.setNextPlayerToAct();
        }
    }

    // if the validation layer takes care of most things,
    // then its possible to get rid of these methods, and of
    // the CHECK_ACTION / FOLD_ACTION constants
    check() {
        this.audioService.playCheckSFX();
        this.gsm.setPlayerLastActionType(this.gsm.getCurrentPlayerToAct(), BettingRoundActionType.CHECK);
    }

    fold() {
        this.audioService.playFoldSFX();
        this.gsm.setPlayerLastActionType(this.gsm.getCurrentPlayerToAct(), BettingRoundActionType.FOLD);

        // TODO only if player is facing bet
    }

    bet(betAmount: number, playerPlacingBlindBetUUID?: string) {
        this.audioService.playBetSFX();

        // TODO is playerPlacingBlindBet correct design?
        // after all, a blind is a special case of a normal bet,
        // so in theory it belongs in this method as a code path.
        // However, the blinds are placed only once per hand whereas
        // bets take place an arbitrary number of times. Perhaps then it
        // is better to separate them.

        // place the bet (or the blind)
        const currentPlayerToAct = playerPlacingBlindBetUUID
            ? playerPlacingBlindBetUUID
            : this.gsm.getCurrentPlayerToAct();
        this.gsm.setPlayerBetAmount(currentPlayerToAct, betAmount);
        const isPlayerAllIn = this.gsm.hasPlayerPutAllChipsInThePot(currentPlayerToAct);

        // if we're placing blinds and not all in, set the last action to waiting_to_act
        this.gsm.setPlayerLastActionType(
            currentPlayerToAct,
            isPlayerAllIn
                ? BettingRoundActionType.ALL_IN
                : playerPlacingBlindBetUUID
                ? BettingRoundActionType.PLACE_BLIND
                : BettingRoundActionType.BET,
        );

        /* TODO
           Also ensure that other players cannot reraise after this.
           This will be done by 
           1) changing buttons available to UI
           2) validation in the validationservice
           Determine boolean expression that represents whether a player can raise.
           playerCanRaise = facingRaise || waitingToAct
           facingRaise = lastAmountPutInPot > yourLastBet + minRaiseDiff ???
        */

        // actualBetAmount should never differ from action.amount.
        // TODO remove assertion
        const actualBetAmount = this.gsm.getPlayerBetAmount(currentPlayerToAct);
        assert(actualBetAmount === betAmount);

        const previousRaise = this.gsm.getPreviousRaise();
        const minRaiseDiff = betAmount - previousRaise;

        // If player is all in, and is not reraising, it is considered a call. However, since
        // they are putting more chips in the pot, it will still go through this code path.
        // In thise case, we do not update the minRaiseDiff or previousRaise, but only the
        // partialAllInLeftOver.
        if (actualBetAmount > previousRaise && actualBetAmount < previousRaise + minRaiseDiff) {
            // TODO remove assertion
            assert(isPlayerAllIn);
            const partialAllInLeftOver = actualBetAmount - previousRaise;
            this.gsm.updateGameState({
                partialAllInLeftOver,
            });
        } else {
            // If SB/BB are going all in with less than a blind preflop, if you have more than one BB
            // you cant call less then the BB, you must put in at least a BB
            this.gsm.updateGameState({
                minRaiseDiff: playerPlacingBlindBetUUID ? this.gsm.getBB() : actualBetAmount - previousRaise,
                previousRaise: playerPlacingBlindBetUUID ? this.gsm.getBB() : actualBetAmount,
            });
        }
    }

    callBet() {
        this.audioService.playCallSFX();
        const currentPlayerToAct = this.gsm.getCurrentPlayerToAct();

        // If player is facing a bet that is larger than their stack, they can CALL and go all-in.
        // TODO find the cleanest way to do this. Should that logic be handled in setPlayerBetAmount, or here?
        this.gsm.setPlayerBetAmount(currentPlayerToAct, this.gsm.getPreviousRaise());

        const isPlayerAllIn = this.gsm.hasPlayerPutAllChipsInThePot(currentPlayerToAct);
        this.gsm.setPlayerLastActionType(
            currentPlayerToAct,
            isPlayerAllIn ? BettingRoundActionType.ALL_IN : BettingRoundActionType.CALL,
        );
    }

    initializePreflop() {
        this.initializeDealerButton();
        this.gsm.initializeNewDeck();
        this.distributeHoleCards();

        // important that the cards are distributed before the blinds are placed,
        // because the setCurrentPlayerToAct method checks to see if everyone has acted,
        // and if so, it nulls the currentPlayerToAct instead of setting it.
        // Whether or not everyone has acted or not is calculated by looking at those
        // who were dealt in. If the cards havent been distributed yet, nobody has been dealt in,
        // and therefore hasEveryoneActed is vacuously true. It might be worthwhile to refactor
        // the setCurrentPlayerToAct method, and remove that logic from it to avoid bugs.
        this.placeBlinds();

        // TODO bettingRoundStage is already preflop here. Remove
        this.gsm.setBettingRoundStage(BettingRoundStage.PREFLOP);
    }

    initializeDealerButton() {
        const seats = this.gsm.getSeats();
        const [_, seatZeroPlayerUUID] = seats[0];
        const dealerUUID = this.gsm.getDealerUUID()
            ? this.gsm.getNextPlayerReadyToPlayUUID(this.gsm.getDealerUUID())
            : seatZeroPlayerUUID;

        this.gsm.updateGameState({ dealerUUID });
    }

    /*
        TODO ensure that the players have enough to cover the blinds, and if not, put them
        all-in. Don't let a player get this point if they have zero chips, stand them up earlier.
        TODO substract chips from the players
    */
    placeBlinds() {
        const numPlayersReadyToPlay = this.gsm.getPlayersReadyToPlay().length;
        const dealerUUID = this.gsm.getDealerUUID();
        const SB = this.gsm.getSB();
        const BB = this.gsm.getBB();

        const smallBlindUUID =
            numPlayersReadyToPlay === 2 ? dealerUUID : this.gsm.getNextPlayerReadyToPlayUUID(dealerUUID);
        const bigBlindUUID = this.gsm.getNextPlayerReadyToPlayUUID(smallBlindUUID);

        // the players have to be waiting to act because they can still raise even
        // if everyone before them calls

        this.bet(SB, smallBlindUUID);
        this.bet(BB, bigBlindUUID);

        // If heads up, dealer is first to act
        const firstToActPreflop =
            this.gsm.getPlayersReadyToPlay().length === 2
                ? dealerUUID
                : this.gsm.getNextPlayerReadyToPlayUUID(bigBlindUUID);

        this.gsm.setFirstToAct(firstToActPreflop);

        assert(this.gsm.getMinRaiseDiff() === BB && this.gsm.getPreviousRaise() === BB);
    }

    distributeHoleCards() {
        const deck = this.gsm.getDeck();
        // TODO remove assertion
        assert(deck.cards.length === 52);
        Object.values(this.gsm.getPlayers())
            .filter((player) => player.sitting)
            .forEach((player) => this.gsm.dealCardsToPlayer(2, player.uuid));
    }

    /* STREETS */
    initializeFlop() {
        assert(this.gsm.getBettingRoundStage() === BettingRoundStage.FLOP);
        this.gsm.setFirstToAct(this.gsm.getNextPlayerInHandUUID(this.gsm.getDealerUUID()));
        this.gsm.dealCardsToBoard(3);
        this.updateHandDescriptions();
    }

    initializeTurn() {
        assert(this.gsm.getBettingRoundStage() === BettingRoundStage.TURN);
        this.gsm.setFirstToAct(this.gsm.getNextPlayerInHandUUID(this.gsm.getDealerUUID()));
        this.gsm.dealCardsToBoard(1);
        this.updateHandDescriptions();
    }

    initializeRiver() {
        assert(this.gsm.getBettingRoundStage() === BettingRoundStage.RIVER);
        this.gsm.setFirstToAct(this.gsm.getNextPlayerInHandUUID(this.gsm.getDealerUUID()));
        this.gsm.dealCardsToBoard(1);
        this.updateHandDescriptions();
    }

    showDown() {
        const board = this.gsm.getBoard();
        const playersHands: [string, any][] = this.gsm
            .getPlayersInHand()
            .map((playerUUID) => [
                playerUUID,
                this.handSolverService.computeBestHandFromCards([
                    ...this.gsm.getPlayer(playerUUID).holeCards,
                    ...board,
                ]),
            ]);

        const snapShots: GameState[] = [];

        // Calculte the winner for every pot, snapshot resulting gameState, store in queue.
        this.gsm.getPots().forEach((pot) => {
            const eligiblePlayers: [string, Hand][] = playersHands.filter(([uuid, hand]) =>
                pot.contestors.includes(uuid),
            );
            const winningHands: Hand[] = this.handSolverService.getWinningHands(
                eligiblePlayers.map(([uuid, hand]) => hand),
            );
            const winningPlayers: string[] = eligiblePlayers
                .filter(([uuid, hand]) => winningHands.includes(hand))
                .map(([uuid, hand]) => uuid);

            /** Split chips evenly amongst winners, distributing odd chips by early position
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
                    const amount = oddChips ? evenSplit + 1 : evenSplit;
                    oddChips -= 1;
                    return [playerUUID, amount];
                }),
            );

            // Show everyones hand at showdown if they havent folded yet.
            // TODO show only those hands youre supposed to show.
            this.gsm.updatePlayers((player) => (this.gsm.isPlayerInHand(player.uuid) ? { cardsAreHidden: false } : {}));

            this.gsm.updatePlayers((player) =>
                winningPlayers.includes(player.uuid)
                    ? // TODO the players winning hand would go here too.
                      { chips: player.chips + amountsWon[player.uuid], winner: true }
                    : { winner: false },
            );

            this.gsm.updateGameState({ isStateReady: true });
            snapShots.push(this.gsm.snapShotGameState());
        });
        assert(snapShots.length > 0, 'snapShots length was 0.');

        this.gsm.updateGameState({ isStateReady: false });

        // TODO make external const
        const interval = 3000;
        for (const index in snapShots) {
            const snapShot = snapShots[index];
            this.timerManager.setTimer(
                () => {},
                () => snapShot,
                interval * Number(index),
            );
        }
        // TODO make this better. It seems they are not all being displayed.
        this.triggerFinishHand(interval * snapShots.length);

        // Inititate timer sequence that shows each pot winner for two seconds (or something)
    }

    // TODO make all references to this use a constant not a literal
    triggerFinishHand(timeout: number) {
        this.timerManager.setTimer(
            () => this.finishHand(),
            () => this.gsm.getGameState(),
            timeout,
        );
    }

    finishHand() {
        this.gsm.clearBettingRoundStage();
        this.ejectStackedPlayers();
        this.gsm.clearStateOfRoundInfo();
        this.startHandIfReady();
    }

    ejectStackedPlayers() {
        this.gsm.updatePlayers((player) => (player.chips === 0 ? { sitting: false } : {}));
    }

    // TODO Redesign pot structure to make it simple.
    // TODO create elegant methods for pot control in gameStateManager
    // TODO make this more elegant
    placeBetsInPot() {
        let playerBets: [number, string][] = Object.entries(this.gsm.getPlayers()).map(([uuid, player]) => [
            player.betAmount,
            uuid,
        ]);

        // TODO see if you can make this more functional style
        const sidePots: Pot[] = [];
        while (playerBets.length > 0) {
            const minimumBet: number = playerBets.reduce(
                (prev: number, [betAmount, uuid]) => (betAmount < prev ? betAmount : prev),
                playerBets[0][0],
            );

            const pot: Pot = {
                value: minimumBet * playerBets.length,
                contestors: playerBets.map(([betAmount, uuid]) => uuid).sort(),
            };

            sidePots.push(pot);

            // TODO why is the cast necessary? compiler errors without it
            playerBets = playerBets
                .map(([betAmount, uuid]) => [betAmount - minimumBet, uuid] as [number, string])
                .filter(([betAmount, uuid]) => betAmount > 0);
        }

        // TODO can there ever be more than one uncalled bet? idts
        const gamePots: Pot[] = [];
        const uncalledBets: Pot[] = [];
        sidePots.forEach((pot) => (pot.contestors.length === 1 ? uncalledBets.push(pot) : gamePots.push(pot)));

        uncalledBets.forEach((pot) => {
            const playerUUID = pot.contestors[0];
            const uncalledBet = pot.value;
            this.gsm.updatePlayer(playerUUID, { betAmount: this.gsm.getPlayerBetAmount(playerUUID) - uncalledBet });
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
            contestors: contestorsStr.split(','),
        }));

        this.gsm.updateGameState({ pots: coalescedPots });

        // update players chip counts
        this.gsm.updatePlayers((player) => ({ chips: player.chips - player.betAmount, betAmount: 0 }));
    }

    triggerVictoryByFolding() {
        this.timerManager.setTimer(
            () => this.victoryByFolding(),
            () => this.gsm.getGameState(),
            900,
        );
    }

    victoryByFolding() {
        const winnerUUID = this.gsm.getPlayersInHand()[0];
        this.gsm.updatePlayer(winnerUUID, { winner: true });
        this.clearCurrentPlayerToAct();
        this.placeBetsInPot();
        this.giveWinnerThePot(winnerUUID);
        this.triggerFinishHand(2000);
    }

    giveWinnerThePot(winnerUUID: string) {
        this.gsm.addPlayerChips(winnerUUID, this.gsm.getTotalPot());
    }

    triggerFinishBettingRound() {
        this.clearCurrentPlayerToAct();
        this.timerManager.setTimer(
            () => this.finishBettingRound(),
            () => this.gsm.getGameState(),
            900,
        );
    }

    finishBettingRound() {
        this.placeBetsInPot();

        // TODO this code will never not execute  here I believe. refactor
        // placeBetsInPot and clearCurrentPlayerToAct seem to be common logic
        // between victory by folding and finish betting round. See if you can
        // put them in their own function, or incorporate victoryByFolding into finish
        // betting round?
        // What is the most logical time to check for a hand result? Immediately after an action
        // or at "the end" of a betting round? The only "end of betting round" in which this applies
        // is showdown.
        if (!this.gsm.currentHandHasResult()) {
            this.gsm.nextBettingRound();
            this.initializeBettingRound();
        }
    }
}
