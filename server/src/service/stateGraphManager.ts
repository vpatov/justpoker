import { Service } from 'typedi';
import {
    Condition,
    StateGraph,
    Action,
    Timeout,
    GraphNode,
    GraphEdge,
    instanceOfCondition,
    StageDelayMap,
} from '../../../ui/src/shared/models/stateGraph';
import {
    GameStage,
    ServerStateKey,
    QueuedServerAction,
    ServerActionType,
} from '../../../ui/src/shared/models/gameState';
import { ActionType, GeneralAction, ServerAction, ClientAction } from '../../../ui/src/shared/models/dataCommunication';
import { GameStateManager } from './gameStateManager';
import { GamePlayService } from './gamePlayService';
import { TimerManager } from './timerManager';
import { BettingRoundStage } from '../../../ui/src/shared/models/game';
import { Subject } from 'rxjs';
import { LedgerService } from './ledgerService';
import { MessageService } from './messageService';
import { GameInstanceManager } from './gameInstanceManager';

const MAX_CONDITION_DEPTH = 3;

@Service()
export class StateGraphManager {
    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly gamePlayService: GamePlayService,
        private readonly timerManager: TimerManager,
        private readonly ledgerService: LedgerService,
        private readonly messageService: MessageService,
        private readonly gameInstanceManager: GameInstanceManager,
    ) {}

    private stateGraphUpdateEmitter: Subject<void> = new Subject();

    observeStateGraphUpdates() {
        return this.stateGraphUpdateEmitter.asObservable();
    }

    canContinueGameCondition: Condition = {
        fn: () => this.gameStateManager.canDealNextHand(),
        TRUE: GameStage.INITIALIZE_NEW_HAND,
        FALSE: GameStage.NOT_IN_PROGRESS,
    };

    isHandGamePlayOverCondition: Condition = {
        fn: () =>
            this.gameStateManager.hasEveryoneButOnePlayerFolded() ||
            this.gameStateManager.getBettingRoundStage() === BettingRoundStage.RIVER,
        TRUE: GameStage.SHOW_WINNER,
        FALSE: GameStage.SHOW_START_OF_BETTING_ROUND,
    };

    isAllInRunOutCondition: Condition = {
        fn: () => this.gameStateManager.isAllInRunOut(),
        TRUE: this.isHandGamePlayOverCondition,
        FALSE: GameStage.SET_CURRENT_PLAYER_TO_ACT,
    };

    isBettingRoundOverCondition: Condition = {
        fn: () => this.gameStateManager.isBettingRoundOver() || this.gameStateManager.hasEveryoneButOnePlayerFolded(),
        TRUE: GameStage.FINISH_BETTING_ROUND,
        FALSE: GameStage.SET_CURRENT_PLAYER_TO_ACT,
    };

    sidePotsRemainingCondition: Condition = {
        fn: () => this.gameStateManager.getPots().length >= 1,
        TRUE: GameStage.SHOW_WINNER,
        FALSE: GameStage.POST_HAND_CLEANUP,
    };

    stateGraph: Readonly<StateGraph> = {
        [GameStage.NOT_IN_PROGRESS]: new Map([
            [ClientAction.STARTGAME, this.canContinueGameCondition],
            [ClientAction.SITDOWN, this.canContinueGameCondition],
            [ClientAction.SITIN, this.canContinueGameCondition],
            [ClientAction.JOINTABLEANDSITDOWN, this.canContinueGameCondition],
        ]),
        [GameStage.INITIALIZE_NEW_HAND]: new Map([[ServerAction.TIMEOUT, GameStage.SHOW_START_OF_HAND]]),
        [GameStage.SHOW_START_OF_HAND]: new Map([[ServerAction.TIMEOUT, GameStage.SHOW_START_OF_BETTING_ROUND]]),
        [GameStage.SHOW_START_OF_BETTING_ROUND]: new Map([[ServerAction.TIMEOUT, this.isAllInRunOutCondition]]),
        [GameStage.SET_CURRENT_PLAYER_TO_ACT]: new Map([[ServerAction.TIMEOUT, GameStage.WAITING_FOR_BET_ACTION]]),
        [GameStage.WAITING_FOR_BET_ACTION]: new Map([
            [ClientAction.BETACTION, GameStage.SHOW_BET_ACTION],
            [ClientAction.USETIMEBANK, GameStage.WAITING_FOR_BET_ACTION],
            [ServerAction.TIMEOUT as any, GameStage.SHOW_BET_ACTION],
        ]),
        [GameStage.SHOW_BET_ACTION]: new Map([[ServerAction.TIMEOUT, this.isBettingRoundOverCondition]]),
        [GameStage.FINISH_BETTING_ROUND]: new Map([[ServerAction.TIMEOUT, this.isHandGamePlayOverCondition]]),
        [GameStage.SHOW_WINNER]: new Map([[ServerAction.TIMEOUT, this.sidePotsRemainingCondition]]),
        [GameStage.POST_HAND_CLEANUP]: new Map([[ServerAction.TIMEOUT, this.canContinueGameCondition]]),
    };

    stageDelayMap: StageDelayMap = {
        [GameStage.NOT_IN_PROGRESS]: 0,
        [GameStage.INITIALIZE_NEW_HAND]: 250,
        [GameStage.SHOW_START_OF_HAND]: 400,
        [GameStage.SHOW_START_OF_BETTING_ROUND]: 750,
        [GameStage.SET_CURRENT_PLAYER_TO_ACT]: 50, // TODO there does not need to be a delay here.
        [GameStage.WAITING_FOR_BET_ACTION]: 0,
        [GameStage.SHOW_BET_ACTION]: 200,
        [GameStage.FINISH_BETTING_ROUND]: 1200,
        [GameStage.SHOW_WINNER]: 4000,
        [GameStage.POST_HAND_CLEANUP]: 400,
    };

    getDelay(stage: GameStage) {
        return stage === GameStage.WAITING_FOR_BET_ACTION
            ? this.gamePlayService.computeTimeRemainingToAct()
            : this.stageDelayMap[stage];
    }

    /**
     * @param GeneralAction The type of the event that just occured. Either an ActionType or TIMEOUT.
     * @returns The graph edge that represents the state transition if the transition is defined,
     * null otherwise.
     */
    getEdge(ga: GeneralAction): GraphEdge {
        const gameStage = this.gameStateManager.getGameStage();
        const edge = this.stateGraph[gameStage].get(ga);

        if (!!edge) {
            /* 
                TODO
                If the edge is not defined in the map, one of the following conditions is true:
                    - A timeout event has occurred during the NOT_IN_PROGRESS stage, during which
                    timeout processing is undefined. This is a bug if it happens.
                    - An action that cannot be currently processed has been sent by the user. It will
                    either be queued or discarded. For now, they will be discarded (TODO).
                    - An action that can be processed at any time assuming it is valid (add chips, chat, etc.)
            */
        }
        return edge;
    }

    /**
     * @param GeneralAction The type of the event that just occured. Either an ActionType or TIMEOUT.
     * @returns The next stage to transition to if the event/current stage represent a defined
     * state transition. Returns null otherwise.
     */
    getNextStage(GeneralAction: GeneralAction): GraphNode {
        let edge = this.getEdge(GeneralAction);
        let conditionDepth = 0;
        if (!edge) {
            return null;
        }
        while (instanceOfCondition(edge)) {
            edge = this.processCondition(edge);
            conditionDepth += 1;

            // This check has to go inside the loop, because if put into the loop condition, the compiler
            // no longer understands the guarantee of the return type of edge, and thus errors.
            if (conditionDepth === MAX_CONDITION_DEPTH) {
                throw Error('Reached maximum condition depth. This is a bug.');
            }
        }
        return edge;
    }

    /**
     * @param condition Condition to evaluate
     * @returns Evaluates the condition and returns the corresponding edge.
     */
    processCondition(condition: Condition): GraphEdge {
        return condition.fn() ? condition.TRUE : condition.FALSE;
    }

    // - MessageService receives the message, validates the action
    //     (validation service will use stages to simplify validation)
    // - MessageService executes the action if valid.
    // - After executing the action, messageService calls this processEvent method.
    // - If the event is a defined state transition path, a state transition is executed.
    processEvent(event: GeneralAction) {
        const nextStage = this.getNextStage(event);
        if (nextStage) {
            this.initializeGameStage(nextStage);
        }
        this.stateGraphUpdateEmitter.next();
    }

    processTimeout(gameInstanceUUID: string) {
        // If the timer runs out and we are in the waiting for bet action stage, that means that
        // the player time has run out. This is the only case where it is necessary to perform
        // an action manually before transitioning to the next stage, and so this is the only case
        // that slightly breaks the pattern. The alternative is to create an extra GameStage that
        // a timeout could map to, but that's not ideal because its a more verbose solution,
        // and transitioning from that intermediary stage to SHOW_BET_ACTION would require a
        // no-op delay, which also breaks the pattern
        this.gameInstanceManager.loadGameInstance(gameInstanceUUID);
        if (this.gameStateManager.getGameStage() === GameStage.WAITING_FOR_BET_ACTION) {
            this.gamePlayService.timeOutPlayer();
        }
        this.gameStateManager.setUpdatedKeys(new Set([ServerStateKey.GAMESTATE]));
        this.processEvent(ServerAction.TIMEOUT);
    }

    // The changes executed while entering a game stage should be general and applicable no matter
    // what path was taken to get to that stage. If there is logic that is specific to a path, then
    // that logic should be executed on the way to the stage. This method should only be called if
    // a defined state transition path was executed. For example, if someone adds chips during the
    // WAITING_FOR_BET_ACTION stage, that should not trigger any timer restarts (this method shouldnt
    // be called)
    initializeGameStage(stage: GameStage) {
        // TODO write assertions checking for preconditions of each stage after entering stage
        this.gameStateManager.updateGameStage(stage);

        switch (stage) {
            case GameStage.NOT_IN_PROGRESS: {
                this.gameStateManager.clearStateOfHandInfo();
                break;
            }
            case GameStage.INITIALIZE_NEW_HAND: {
                break;
            }

            // TODO consider renaming this to initialize new hand, and getting rid of the extra state above.
            case GameStage.SHOW_START_OF_HAND: {
                this.gameStateManager.initializeNewDeck();
                this.gamePlayService.initializeDealerButton();
                this.gamePlayService.placeBlinds();
                this.gameStateManager.updateGameState({ bettingRoundStage: BettingRoundStage.WAITING });
                break;
            }

            case GameStage.SHOW_START_OF_BETTING_ROUND: {
                this.gameStateManager.incrementBettingRoundStage();
                this.gamePlayService.resetBettingRoundActions();
                this.gamePlayService.initializeBettingRound();
                if (!this.gameStateManager.isAllInRunOut()) {
                    this.gamePlayService.setFirstToActAtStartOfBettingRound();
                }
                this.gamePlayService.startOfBettingRound();
                break;
            }

            case GameStage.SET_CURRENT_PLAYER_TO_ACT: {
                this.gamePlayService.computeAndSetCurrentPlayerToAct();
                break;
            }

            case GameStage.WAITING_FOR_BET_ACTION: {
                this.gamePlayService.setTimeCurrentPlayerTurnStarted();
                break;
            }

            case GameStage.SHOW_BET_ACTION: {
                this.gameStateManager.clearTimeBanksUsedThisAction();
                break;
            }

            case GameStage.FINISH_BETTING_ROUND: {
                this.gamePlayService.placeBetsInPot();
                this.gameStateManager.clearCurrentPlayerToAct();
                break;
            }

            // TODO Showdown probably should be a separate stage from show winner.
            // They can be one stage for now.
            case GameStage.SHOW_WINNER: {
                this.gamePlayService.showDown();
                break;
            }

            case GameStage.POST_HAND_CLEANUP: {
                this.ledgerService.incrementHandsWonForPlayers(
                    [...this.gameStateManager.getHandWinners()].map((playerUUID) =>
                        this.gameStateManager.getClientByPlayerUUID(playerUUID),
                    ),
                );
                this.gameStateManager.clearStateOfHandInfo();
                this.gamePlayService.ejectStackedPlayers();

                this.executeQueuedServerActions();
                break;
            }
        }

        const delay = this.getDelay(stage);
        if (delay) {
            const gameInstanceUUID = this.gameInstanceManager.getActiveGameInstanceUUID();
            this.timerManager.setStateTimer(() => this.processTimeout(gameInstanceUUID), delay);
        }

        this.updateLedger();
    }

    updateLedger() {
        this.gameStateManager.forEveryClient((client) => {
            const player = this.gameStateManager.getPlayerByClientUUID(client.uuid);
            if (player) {
                this.ledgerService.setCurrentChips(client.uuid, this.gameStateManager.getChips(player.uuid));
            }
        });
    }

    executeQueuedServerAction(action: QueuedServerAction) {
        switch (action.actionType) {
            case ServerActionType.BOOT_PLAYER: {
                const playerUUID = [...action.args][0];
                this.gameStateManager.bootPlayerFromGame(playerUUID);
            }
        }
    }

    // TODO actually check preconditions for executing queued actions and design
    // elegant queueing / precondition check / function+argument delivery.
    executeQueuedServerActions() {
        this.gameStateManager.getQueuedServerActions().forEach((action) => this.executeQueuedServerAction(action));
        this.gameStateManager.updateGameState({ queuedServerActions: [] });
    }
}
