import { Service } from 'typedi';
import { GameStateManager } from './gameStateManager';
import { BettingRoundAction, BettingRoundActionType, BettingRoundStage } from '../../../shared/models/game';
import { strict as assert } from 'assert';
import { HandSolverService } from './handSolverService';
import { TimerManager } from './timerManager';
import { Pot } from '../../../shared/models/gameState';

@Service()
export class GamePlayService {
    constructor(
        private readonly gsm: GameStateManager,
        private readonly handSolverService: HandSolverService,
        private readonly timerManager: TimerManager,
    ) {}

    /* Gameplay functionality */

    // if game is started, and state is waiting, try to initializeGameRound
    // perform this check after every incoming message
    // this way, you don't have to check explicit events
    startGame() {
        this.gsm.updateGameState({ gameInProgress: true });
    }

    // TODO wipe gameplay game state.
    stopGame() {
        this.gsm.updateGameState({ gameInProgress: false });
    }

    // are there only two actions after which a round can start?
    // after sit down and after start game?
    // regardless, better to not tie start game condition check
    // to be dependent on those actions
    startHandIfReady() {
        if (
            // TODO uncomment this once startGame button is added
            // this.gsm.isGameInProgress() &&
            this.gsm.getBettingRoundStage() === BettingRoundStage.WAITING &&
            this.gsm.getNumberPlayersSitting() >= 2
        ) {
            this.gsm.clearStateOfRoundInfo();
            this.initializeBettingRound();
        }
    }

    initializeBettingRound() {
        // TODO timer - this seems like it would a good place to handle the timer

        const stage = this.gsm.getBettingRoundStage();
        const playersEligibleToActNext = this.gsm.getPlayersEligibleToActNext();

        /**
         * The betting round is in all-in run out if either everyone has gone all in,
         * or there is one person who is not all in, but they have called the all-in.
         */
        debugger;
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
                this.triggerFinishHand();
                break;
            }
        }

        // TODO timer if everyone is all in
        if (this.gsm.isBettingRoundOver()) {
            this.triggerFinishBettingRound();
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

        if (this.gsm.isBettingRoundOver()) {
            this.triggerFinishBettingRound();
        } else {
            this.gsm.setNextPlayerToAct();
        }
    }

    // if the validation layer takes care of most things,
    // then its possible to get rid of these methods, and of
    // the CHECK_ACTION / FOLD_ACTION constants
    check() {
        this.gsm.setPlayerLastActionType(this.gsm.getCurrentPlayerToAct(), BettingRoundActionType.CHECK);
    }

    fold() {
        this.gsm.setPlayerLastActionType(this.gsm.getCurrentPlayerToAct(), BettingRoundActionType.FOLD);

        // TODO only if player is facing bet
    }

    bet(action: BettingRoundAction) {
        const currentPlayerToAct = this.gsm.getCurrentPlayerToAct();
        this.gsm.setPlayerBetAmount(currentPlayerToAct, action.amount);
        const isPlayerAllIn = this.gsm.hasPlayerPutAllChipsInThePot(currentPlayerToAct);

        this.gsm.setPlayerLastActionType(
            currentPlayerToAct,
            isPlayerAllIn ? BettingRoundActionType.ALL_IN : BettingRoundActionType.BET,
        );

        /* 
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
        assert(actualBetAmount === action.amount);

        const previousRaise = this.gsm.getPreviousRaise();
        const minRaiseDiff = action.amount - previousRaise;

        // if player is all in, and is not reraising, it is considered a call. However, since
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
            this.gsm.updateGameState({
                minRaiseDiff: action.amount - previousRaise,
                previousRaise: action.amount,
            });
        }
    }

    callBet(action: BettingRoundAction) {
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
        // TODO this is where you would start the timer
        this.initializeDealerButton();
        this.placeBlinds();

        this.gsm.initializeNewDeck();
        this.gsm.setBettingRoundStage(BettingRoundStage.PREFLOP);

        this.distributeHoleCards();
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
        this.gsm.updatePlayer(smallBlindUUID, {
            lastActionType: BettingRoundActionType.WAITING_TO_ACT,
            betAmount: SB,
        });

        this.gsm.updatePlayer(bigBlindUUID, {
            lastActionType: BettingRoundActionType.WAITING_TO_ACT,
            betAmount: BB,
        });

        // If heads up, dealer is first to act
        const firstToActPreflop =
            this.gsm.getPlayersReadyToPlay().length === 2
                ? dealerUUID
                : this.gsm.getNextPlayerReadyToPlayUUID(bigBlindUUID);

        this.gsm.updateGameState({
            currentPlayerToAct: firstToActPreflop,
            minRaiseDiff: BB,
            previousRaise: BB,
        });
    }

    distributeHoleCards() {
        const deck = this.gsm.getDeck();
        Object.values(this.gsm.getPlayers())
            .filter((player) => player.sitting)
            .forEach((player) => this.gsm.dealCardsToPlayer(2, player.uuid));
    }

    /* STREETS */
    initializeFlop() {
        assert(this.gsm.getBettingRoundStage() === BettingRoundStage.FLOP);
        this.gsm.setCurrentPlayerToAct(this.gsm.getNextPlayerInHandUUID(this.gsm.getDealerUUID()));
        this.gsm.dealCardsToBoard(3);
    }

    initializeTurn() {
        assert(this.gsm.getBettingRoundStage() === BettingRoundStage.TURN);
        this.gsm.setCurrentPlayerToAct(this.gsm.getNextPlayerInHandUUID(this.gsm.getDealerUUID()));
        this.gsm.dealCardsToBoard(1);
    }

    initializeRiver() {
        assert(this.gsm.getBettingRoundStage() === BettingRoundStage.RIVER);
        this.gsm.setCurrentPlayerToAct(this.gsm.getNextPlayerInHandUUID(this.gsm.getDealerUUID()));
        this.gsm.dealCardsToBoard(1);
    }

    showDown() {
        const board = this.gsm.getBoard();
        const playersHands = Object.fromEntries(
            this.gsm
                .getPlayersInHand()
                .map((playerUUID) => [
                    playerUUID,
                    this.handSolverService.computeBestHandFromCards([
                        ...this.gsm.getPlayer(playerUUID).holeCards,
                        ...board,
                    ]),
                ]),
        );
        const winningHands = this.handSolverService.getWinningHands(Object.values(playersHands));
        const winningPlayers = Object.entries(playersHands)
            .filter(([uuid, hand]) => winningHands.includes(hand))
            .map(([uuid, hand]) => uuid);

        this.gsm.updatePlayers((player) => ({ winner: winningPlayers.includes(player.uuid) }));
    }

    triggerFinishHand() {
        this.timerManager.setTimer(this, this.finishHand, 4000);
    }

    finishHand() {
        this.givePotToWinner();
        this.gsm.clearBettingRoundStage();
        this.startHandIfReady();
    }

    // TODO side pots
    givePotToWinner() {
        const numWinners = Object.entries(this.gsm.getPlayers()).filter(([uuid, player]) => player.winner).length;
        this.gsm.updatePlayers((player) =>
            player.winner ? { chips: player.chips + this.gsm.getTotalPot() / numWinners } : {},
        );
    }

    // TODO method doesnt account for allins properly.
    // TODO Redesign pot structure to make it simple.
    // TODO create elegant methods for pot control in gameStateManager

    // 1) Give uncalled bets back to bettor
    // (hero raise to 100, villain1 goes all in for 20, everyone else folds, hero gets back 80)
    // 2) Those who are going all-in are only eligible to win what they put in.
    // you are eligible to win less than you put in if: your bet isnt fully matched by others
    //
    placeBetsInPot() {
        // put bets in pot

        let playerBets: [number, string][] = Object.entries(this.gsm.getPlayers()).map(([uuid, player]) => [
            player.betAmount,
            uuid,
        ]);

        const pots = [];

        while (playerBets.length > 0) {
            const minimumBet: number = playerBets.reduce(
                (prev: number, [betAmount, uuid]) => (betAmount < prev ? betAmount : prev),
                playerBets[0][0],
            );

            const pot: Pot = {
                value: minimumBet * playerBets.length,
                contestors: playerBets.map(([betAmount, uuid]) => uuid),
            };

            pots.push(pot);

            // TODO why is the cast necessary? compiler errors without it
            playerBets = playerBets
                .map(([betAmount, uuid]) => [betAmount - minimumBet, uuid] as [number, string])
                .filter(([betAmount, uuid]) => betAmount > 0);
        }

        this.gsm.updateGameState({
            pots: [...this.gsm.getGameState().pots, ...pots],
        });

        // update players chip counts
        this.gsm.updatePlayers((player) => ({ chips: player.chips - player.betAmount, betAmount: 0 }));
    }

    checkForVictoryCondition() {
        const playersInHand = this.gsm.getPlayersInHand();
        if (playersInHand.length === 1) {
            const winnerUUID = playersInHand[0];
            this.gsm.updatePlayer(winnerUUID, { winner: true });
            this.triggerFinishHand();
        }
        // check for victory condition:
        // either everyone folded but one person,
        // or this is the river and its time for showdown
        // if someone wins, add the hand result to the gameState (UI shows victory)
    }

    triggerFinishBettingRound() {
        this.timerManager.setTimer(this, this.finishBettingRound, 3000);
    }

    finishBettingRound() {
        this.placeBetsInPot();
        this.checkForVictoryCondition();
        this.gsm.clearCurrentPlayerToAct();

        if (!this.gsm.currentHandHasResult()) {
            this.gsm.nextBettingRound();
            this.initializeBettingRound();
        }
    }
}
