import { Service } from 'typedi';
import { GameStateManager } from './gameStateManager';
import { BettingRoundAction, BettingRoundActionType, BettingRoundStage } from '../../../shared/models/game';
import { strict as assert } from 'assert';
import { HandSolverService } from './handSolverService';
import { TimerManager } from './timerManager';

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

        this.gsm.updatePlayers((player) =>
            this.gsm.isPlayerInHand(player.uuid)
                ? { lastActionType: BettingRoundActionType.WAITING_TO_ACT, betAmount: 0 }
                : {},
        );

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

        if (this.gsm.haveAllPlayersActed() || this.gsm.getPlayersInHand().length === 1) {
            this.finishBettingRound();

            if (!this.gsm.currentHandHasResult()) {
                this.gsm.nextBettingRound();
                this.initializeBettingRound();
            }
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
    }

    bet(action: BettingRoundAction) {
        const currentPlayerToAct = this.gsm.getCurrentPlayerToAct();
        this.gsm.setPlayerLastActionType(currentPlayerToAct, BettingRoundActionType.BET);
        this.gsm.setPlayerBetAmount(currentPlayerToAct, action.amount);

        this.gsm.updateGameState({
            minRaiseDiff: action.amount - this.gsm.getPreviousRaise(),
            previousRaise: action.amount,
            partialAllInLeftOver: 0,
        });
    }

    callBet(action: BettingRoundAction) {
        const currentPlayerToAct = this.gsm.getCurrentPlayerToAct();
        this.gsm.setPlayerLastActionType(currentPlayerToAct, BettingRoundActionType.CALL);

        // TODO verify if this is ever incorrect
        this.gsm.setPlayerBetAmount(currentPlayerToAct, this.gsm.getPreviousRaise());
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

    finishHand() {
        console.log('\nfinishHand\n');
        this.timerManager.setTimer(this, this.finishRound, 2000);
    }

    finishRound() {
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
    placeBetsInPot() {
        // put bets in pot
        this.gsm.updateGameState({
            pots: [
                ...this.gsm.getGameState().pots,
                {
                    value: Object.values(this.gsm.getPlayers()).reduce((sum, player) => player.betAmount + sum, 0),
                    contestors: [...this.gsm.getPlayersInHand()],
                },
            ],
        });
        // update players chip counts
        this.gsm.updatePlayers((player) => ({ chips: player.chips - player.betAmount, betAmount: 0 }));
    }

    checkForVictoryCondition() {
        const playersInHand = this.gsm.getPlayersInHand();
        if (playersInHand.length === 1) {
            const winnerUUID = playersInHand[0];
            this.gsm.updatePlayer(winnerUUID, { winner: true });
            this.finishHand();
        }
        // check for victory condition:
        // either everyone folded but one person,
        // or this is the river and its time for showdown
        // if someone wins, add the hand result to the gameState (UI shows victory)
    }

    finishBettingRound() {
        this.placeBetsInPot();
        this.checkForVictoryCondition();
        this.gsm.clearCurrentPlayerToAct();
    }
}
