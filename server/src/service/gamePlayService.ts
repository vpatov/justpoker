import { Service } from 'typedi';
import { GameStateManager } from './gameStateManager';
import {
    BettingRoundAction,
    BettingRoundActionType,
    BettingRoundStage,
    CHECK_ACTION,
    GameType,
} from '../../../ui/src/shared/models/game';

import { HandSolverService } from './handSolverService';
import { TimerManager } from './timerManager';
import { Pot, GameState } from '../../../ui/src/shared/models/gameState';

import { AudioService } from './audioService';
import { AnimationService } from '../service/animationService';

import { printObj, logGameState, getLoggableGameState } from '../../../ui/src/shared/util/util';
import { hasError, ValidationService } from './validationService';
import { Hand } from '../../../ui/src/shared/models/cards';
import { LedgerService } from './ledgerService';
import { logger } from '../server/logging';

@Service()
export class GamePlayService {
    constructor(
        private readonly gsm: GameStateManager,
        private readonly handSolverService: HandSolverService,
        private readonly audioService: AudioService,
        private readonly animationService: AnimationService,
        private readonly ledgerService: LedgerService,
        private readonly validationService: ValidationService,
    ) {}

    startGame() {
        this.gsm.updateGameState({ shouldDealNextHand: true });
    }

    stopGame() {
        this.gsm.updateGameState({ shouldDealNextHand: false });
    }

    computeAndSetCurrentPlayerToAct() {
        const previousPlayerToAct = this.gsm.getCurrentPlayerToAct();

        // if there is nor previous player to act, then we are starting the betting round.
        const currentPlayerToAct = previousPlayerToAct
            ? this.gsm.getNextPlayerInHandUUID(previousPlayerToAct)
            : this.gsm.getFirstToAct();

        this.gsm.setCurrentPlayerToAct(currentPlayerToAct);
        this.audioService.playHeroTurnToActSFX(currentPlayerToAct);
    }

    setTimeCurrentPlayerTurnStarted() {
        if (this.gsm.getTimeBanksUsedThisAction() === 0) {
            this.gsm.updateGameState({
                timeCurrentPlayerTurnStarted: Date.now(),
            });
        }
    }

    computeTimeRemainingToAct() {
        const currentPlayerToAct = this.gsm.getCurrentPlayerToAct();
        const timeRemaining =
            this.gsm.getTimeToAct() +
            this.gsm.getSumTimeBankValueThisAction(currentPlayerToAct) -
            this.gsm.getCurrentPlayerTurnElapsedTime();
        return timeRemaining;
    }

    timeOutPlayer() {
        const playerUUID = this.gsm.getCurrentPlayerToAct();
        if (!playerUUID) {
            logger.error(
                `timeOutPlayer was called and there is no currentPlayerToAct. GameState:` +
                    `${getLoggableGameState(this.gsm.getGameState())}`,
            );
            return;
        }
        const clientUUID = this.gsm.getClientByPlayerUUID(playerUUID);
        if (!hasError(this.validationService.validateBettingRoundAction(clientUUID, CHECK_ACTION))) {
            this.check();
        } else {
            this.fold();
            this.gsm.sitOutPlayer(playerUUID);
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

    useTimeBankAction() {
        const currentPlayerToAct = this.gsm.getCurrentPlayerToAct();
        this.gsm.incrementTimeBanksUsedThisAction();
        this.gsm.decrementTimeBanksLeft(currentPlayerToAct);
    }

    /* Betting Round Actions */
    performBettingRoundAction(action: BettingRoundAction) {
        this.gsm.setLastBettingRoundAction(action);
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
        const playerPlacingBet = playerPlacingBlindBetUUID
            ? playerPlacingBlindBetUUID
            : this.gsm.getCurrentPlayerToAct();

        // It is possible that this bet method is called with a betAmount greater
        // than the amount of chips the player has (for example, player is placing
        // a $2 BB but they only have $1). To simplify app logic this is handled here.
        const chips = this.gsm.getChips(playerPlacingBet);
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

        /* TODO
           Also ensure that other players cannot reraise after this.
           This will be done by 
           1) changing buttons available to UI
           2) validation in the validationservice
           Determine boolean expression that represents whether a player can raise.
           playerCanRaise = facingRaise || waitingToAct
           facingRaise = lastAmountPutInPot > yourLastBet + minRaiseDiff ???
        */

        const previousRaise = this.gsm.getPreviousRaise();
        const minRaiseDiff = betAmount - previousRaise;

        // If player is all in, and is not reraising, it is considered a call. However, since
        // they are putting more chips in the pot, it will still go through this code path.
        // In thise case, we do not update the minRaiseDiff or previousRaise, but only the
        // partialAllInLeftOver.
        if (actualBetAmount > previousRaise && actualBetAmount < previousRaise + minRaiseDiff) {
            if (!isPlayerAllIn) {
                throw Error(
                    `Player is not all in, but is raising less than the minimum raise.` +
                        ` GameState: ${getLoggableGameState(this.gsm.getGameState())}`,
                );
            }
            const partialAllInLeftOver = actualBetAmount - previousRaise;
            this.gsm.updateGameState({
                partialAllInLeftOver,
            });
        } else {
            // If SB/BB are going all in with less than a blind preflop, if you have more than one BB
            // you cant call less then the BB, you must put in at least a BB
            this.gsm.updateGameState({
                minRaiseDiff: Math.max(this.gsm.getBB(), actualBetAmount - previousRaise),
                previousRaise: Math.max(this.gsm.getBB(), actualBetAmount),
            });
        }

        this.audioService.playBetSFX();
    }

    callBet() {
        this.audioService.playCallSFX();
        const currentPlayerToAct = this.gsm.getCurrentPlayerToAct();

        // If player is facing a bet that is larger than their stack, they can CALL and go all-in.
        // TODO find the cleanest way to do this. Should that logic be handled in setPlayerBetAmount, or here?
        const chips = this.gsm.getChips(currentPlayerToAct);
        const callAmount = this.gsm.getPreviousRaise() > chips ? chips : this.gsm.getPreviousRaise();
        this.gsm.setPlayerBetAmount(currentPlayerToAct, callAmount);

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
        const straddleUUID = this.gsm.getNextPlayerReadyToPlayUUID(bigBlindUUID);

        const willPlayerStraddle = this.gsm.willPlayerStraddle(straddleUUID);
        const placeStraddle = willPlayerStraddle && numPlayersReadyToPlay > 2;

        this.bet(SB, smallBlindUUID);
        this.bet(BB, bigBlindUUID);
        if (placeStraddle) {
            this.bet(BB * 2, straddleUUID);
        }

        this.gsm.updateGameState({
            smallBlindUUID,
            bigBlindUUID,
            straddleUUID: placeStraddle ? straddleUUID : '',
        });
    }

    setFirstToActAtStartOfBettingRound() {
        const bigBlindUUID = this.gsm.getBigBlindUUID();
        const dealerUUID = this.gsm.getDealerUUID();
        const straddleUUID = this.gsm.getStraddleUUID();
        const headsUp = this.gsm.getPlayersReadyToPlay().length === 2;
        let firstToAct = '';

        if (this.gsm.getBettingRoundStage() === BettingRoundStage.PREFLOP) {
            if (headsUp) {
                firstToAct = dealerUUID;
            } else if (straddleUUID) {
                firstToAct = this.gsm.getNextPlayerInHandUUID(straddleUUID);
            } else {
                firstToAct = this.gsm.getNextPlayerReadyToPlayUUID(bigBlindUUID);
            }
        } else {
            firstToAct = this.gsm.getNextPlayerInHandUUID(dealerUUID);
        }

        this.gsm.setFirstToAct(firstToAct);
    }

    dealHoleCards(playerUUID: string) {
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

        switch (bettingRoundStage) {
            case BettingRoundStage.PREFLOP: {
                this.animationService.animateDeal();
                this.gsm.forEveryPlayer((player) => {
                    if (this.gsm.isPlayerReadyToPlay(player.uuid)) {
                        this.dealHoleCards(player.uuid);
                        this.ledgerService.incrementHandsDealtIn(this.gsm.getClientByPlayerUUID(player.uuid));
                    }
                });

                break;
            }

            case BettingRoundStage.FLOP: {
                this.gsm.dealCardsToBoard(3);
                this.gsm.forEveryPlayer((player) => {
                    if (this.gsm.isPlayerInHand(player.uuid)) {
                        this.ledgerService.incrementFlopsSeen(this.gsm.getClientByPlayerUUID(player.uuid));
                    }
                });
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
                throw Error(
                    `Shouldn't be reaching default switch path in gamePlayService.dealCards.` +
                        ` This is a bug. ${getLoggableGameState(this.gsm.getGameState())}`,
                );
            }
        }
    }

    showDown() {
        const playersHands: [string, any][] = this.gsm
            .getPlayersInHand()
            .map((playerUUID) => [playerUUID, this.gsm.computeBestHandForPlayer(playerUUID)]);

        const pot = this.gsm.popPot();

        const eligiblePlayers: [string, Hand][] = playersHands.filter(([uuid, hand]) => pot.contestors.includes(uuid));
        const winningHands: Hand[] = this.handSolverService.getWinningHands(
            eligiblePlayers.map(([uuid, hand]) => hand),
        );
        const winningPlayers: string[] = eligiblePlayers
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
                const amount = oddChips ? evenSplit + 1 : evenSplit;
                oddChips -= 1;
                return [playerUUID, amount];
            }),
        );

        const shouldShowWinnersCards = !this.gsm.hasEveryoneButOnePlayerFolded();

        // Show everyones hand at showdown if they havent folded yet.
        // TODO show only those hands youre supposed to show.
        this.gsm.updatePlayers((player) =>
            shouldShowWinnersCards ? (this.gsm.isPlayerInHand(player.uuid) ? { cardsAreHidden: false } : {}) : {},
        );

        this.gsm.clearWinnersAndDeltas();

        winningPlayers.forEach((playerUUID) => {
            this.audioService.playHeroWinSFX(playerUUID);
            this.gsm.updatePlayer(playerUUID, {
                chips: this.gsm.getChips(playerUUID) + amountsWon[playerUUID],
                winner: true,
                chipDelta: amountsWon[playerUUID], // used to compute awardPts
            });
            this.gsm.addHandWinner(playerUUID);
        });
    }

    ejectStackedPlayers() {
        this.gsm.forEveryPlayer((player) => {
            if (player.chips === 0) {
                this.gsm.standUpPlayer(player.uuid);
            }
        });
    }

    placeBetsInPot() {
        let playerBets: [number, string][] = Object.entries(this.gsm.getPlayers()).map(([uuid, player]) => [
            player.betAmount,
            uuid,
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
                .map(([betAmount, uuid]) => [betAmount - minimumBet, uuid] as [number, string])
                .filter(([betAmount, uuid]) => betAmount > 0);
        }

        // TODO can there ever be more than one uncalled bet? idts
        const gamePots: Pot[] = [];
        const uncalledBets: Pot[] = [];
        pots.forEach((pot) => (pot.contestors.length === 1 ? uncalledBets.push(pot) : gamePots.push(pot)));

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
