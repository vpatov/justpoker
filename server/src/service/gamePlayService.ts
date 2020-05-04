import { Service } from 'typedi';
import { GameStateManager } from './gameStateManager';
import {
    BettingRoundAction,
    BettingRoundActionType,
    BettingRoundStage,
    CHECK_ACTION,
} from '../../../ui/src/shared/models/game';
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

    startGame() {
        this.gsm.updateGameState({ shouldDealNextHand: true });
    }

    stopGame() {
        this.gsm.updateGameState({ shouldDealNextHand: false });
    }

    canContinueGame(): boolean {
        return this.gsm.shouldDealNextHand() && this.gsm.getNumberPlayersSittingIn() >= 2;
    }

    setCurrentPlayerToAct() {
        const previousPlayerToAct = this.gsm.getCurrentPlayerToAct();

        // if there is nor previous player to act, then we are starting the betting round.
        const currentPlayerToAct = previousPlayerToAct
            ? this.gsm.getNextPlayerInHandUUID(previousPlayerToAct)
            : this.gsm.getFirstToAct();
        // const currentPlayerToAct = this.gsm.haveAllPlayersActed() ? '' : playerUUID;
        this.gsm.setCurrentPlayerToAct(currentPlayerToAct);
        this.audioService.playHeroTurnToActSFX(currentPlayerToAct);

        // start the timer if currentPlayerToAct has been set
        console.log(`Setting player timer for playerUUID: ${currentPlayerToAct}`);
        this.gsm.updateGameState({
            timeCurrentPlayerTurnStarted: Date.now(),
        });
    }

    timeOutPlayer() {
        const playerUUID = this.gsm.getCurrentPlayerToAct();
        if (!playerUUID) {
            console.log('timeOutPlayer was called and there is no currentPlayerToAct. state:');
            logGameState(this.gsm.getGameState());
            return;
        }
        const clientUUID = this.gsm.getClientByPlayerUUID(playerUUID);
        if (!hasError(this.validationService.validateBettingRoundAction(clientUUID, CHECK_ACTION))) {
            this.check();
        } else {
            this.fold();
        }
    }

    updateHandDescriptions() {
        this.gsm.updatePlayers((player) => ({
            handDescription: this.gsm.isPlayerInHand(player.uuid) ? this.gsm.getPlayerHandDescription(player.uuid) : '',
        }));
    }

    startOfBettingRound() {
        this.gsm.updateGameState({
            minRaiseDiff: this.gsm.getBB(),
            previousRaise:
                this.gsm.getBettingRoundStage() === BettingRoundStage.PREFLOP ? this.gsm.getPreviousRaise() : 0,
            partialAllInLeftOver: 0,
        });
        this.updateHandDescriptions();
    }

    resetBettingRoundActions() {
        this.gsm.updatePlayers((player) => {
            if (this.gsm.isPlayerInHand(player.uuid)) {
                return !this.gsm.isPlayerAllIn(player.uuid)
                    ? { lastActionType: BettingRoundActionType.WAITING_TO_ACT, betAmount: 0 }
                    : {};
            } else return {};
        });
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
        this.gsm.setUnsetQueuedAction();
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
        const postBigBlindUUID = this.gsm.getNextPlayerReadyToPlayUUID(bigBlindUUID);

        const isHeadsUp = this.gsm.getPlayersReadyToPlay().length === 2;
        const isStraddle = this.gsm.getPlayerStraddle(postBigBlindUUID); //TODO implement straddle logic

        this.bet(SB, smallBlindUUID);
        this.bet(BB, bigBlindUUID);

        this.gsm.updateGameState({
            smallBlindUUID,
            bigBlindUUID,
        });
        let nextToAct;
        if (!isHeadsUp) {
            // no straddle
            nextToAct = this.gsm.getNextPlayerReadyToPlayUUID(bigBlindUUID);
        } else {
            // heads up
            nextToAct = dealerUUID;
        }

        this.gsm.setFirstToAct(nextToAct);

        assert(this.gsm.getMinRaiseDiff() === BB && this.gsm.getPreviousRaise() === BB);
    }

    setFirstToActAtStartOfBettingRound() {
        const bigBlindUUID = this.gsm.getBigBlindUUID();
        const dealerUUID = this.gsm.getDealerUUID();

        // If heads up preflop, dealer is first to act
        const firstToAct =
            this.gsm.getBettingRoundStage() === BettingRoundStage.PREFLOP
                ? this.gsm.getPlayersReadyToPlay().length === 2
                    ? dealerUUID
                    : this.gsm.getNextPlayerReadyToPlayUUID(bigBlindUUID)
                : this.gsm.getNextPlayerInHandUUID(dealerUUID);

        this.gsm.setFirstToAct(firstToAct);
    }

    dealCards() {
        const bettingRoundStage = this.gsm.getBettingRoundStage();

        switch (bettingRoundStage) {
            case BettingRoundStage.PREFLOP: {
                Object.keys(this.gsm.getPlayers())
                    .filter((playerUUID) => this.gsm.isPlayerReadyToPlay(playerUUID))
                    .forEach((playerUUID) => this.gsm.dealCardsToPlayer(2, playerUUID));
                break;
            }

            case BettingRoundStage.FLOP: {
                this.gsm.dealCardsToBoard(3);
                break;
            }

            case BettingRoundStage.TURN: {
                this.gsm.dealCardsToBoard(1);
                break;
            }

            case BettingRoundStage.RIVER: {
                this.gsm.dealCardsToBoard(1);
                break;
            }

            default: {
                throw Error("Shouldn't be reaching default switch path in gamePlayService.dealCards. This is a bug.");
            }
        }
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

        const pot = this.gsm.popPot();

        const eligiblePlayers: [string, Hand][] = playersHands.filter(([uuid, hand]) => pot.contestors.includes(uuid));
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
        this.gsm.updatePlayers((player) =>
            !this.gsm.hasEveryoneButOnePlayerFolded()
                ? this.gsm.isPlayerInHand(player.uuid)
                    ? { cardsAreHidden: false }
                    : {}
                : {},
        );

        this.gsm.updatePlayers((player) => {
            const isPlayerWinner = winningPlayers.includes(player.uuid);
            if (isPlayerWinner) {
                this.audioService.playHeroWinSFX(player.uuid);
                return { chips: player.chips + amountsWon[player.uuid], winner: true };
            } else {
                return { winner: false };
            }
        });
    }

    ejectStackedPlayers() {
        // TODO this duplicates gameStateManager.standUpPlayer
        this.gsm.updatePlayers((player) => (player.chips === 0 ? { sitting: false, seatNumber: -1 } : {}));
    }

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
}
