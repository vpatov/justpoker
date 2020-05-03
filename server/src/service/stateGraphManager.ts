import { Service } from 'typedi';
import {
    Condition,
    StateGraph,
    Action,
    Timeout,
    EventType,
    GraphNode,
    GraphEdge,
    instanceOfCondition,
    StageDelayMap,
} from '../../../ui/src/shared/models/stateGraph';
import { GameStage } from '../../../ui/src/shared/models/gameState';
import { ActionType } from '../../../ui/src/shared/models/wsaction';
import { GameStateManager } from './gameStateManager';
import { GamePlayService } from './gamePlayService';
import { TimerManager } from './timerManager';

const MAX_CONDITION_DEPTH = 3;

@Service()
export class StateGraphManager {
    constructor(
        private readonly gameStateManager: GameStateManager,
        private readonly gamePlayService: GamePlayService,
        private readonly timerManager: TimerManager,
    ) {}

    canContinueGameCondition: Condition = {
        fn: () => this.gamePlayService.canContinueGame(),
        TRUE: GameStage.INITIALIZE_NEW_HAND,
        FALSE: GameStage.NOT_IN_PROGRESS,
    };

    isHandGamePlayOverCondition: Condition = {
        // everyoneFolded || timeForShowdown
        fn: () => false,
        TRUE: GameStage.SHOW_WINNER,
        FALSE: GameStage.SHOW_START_OF_BETTING_ROUND,
    };

    isAllInRunOutCondition: Condition = {
        // fn -> #playersAllIn >= playersInHand - 1
        fn: () => false,
        TRUE: this.isHandGamePlayOverCondition,
        FALSE: GameStage.WAITING_FOR_BET_ACTION,
    };

    isBettingRoundOverCondition: Condition = {
        // fn -> hasEveryoneActed
        fn: () => false,
        TRUE: GameStage.SHOW_PLACE_BETS_IN_POT,
        FALSE: GameStage.WAITING_FOR_BET_ACTION,
    };

    sidePotsRemainingCondition: Condition = {
        // fn -> potsRemaining >= 1
        fn: () => true,
        TRUE: GameStage.SHOW_WINNER,
        FALSE: this.canContinueGameCondition,
    };

    stateGraph: Readonly<StateGraph> = {
        [GameStage.NOT_IN_PROGRESS]: new Map([
            [ActionType.STARTGAME, this.canContinueGameCondition],
            [ActionType.SITDOWN, this.canContinueGameCondition],
            [ActionType.SITIN, this.canContinueGameCondition],
            [ActionType.JOINTABLEANDSITDOWN, this.canContinueGameCondition],
        ]),
        [GameStage.INITIALIZE_NEW_HAND]: new Map([['TIMEOUT', GameStage.SHOW_START_OF_HAND]]),
        [GameStage.SHOW_START_OF_HAND]: new Map([['TIMEOUT', GameStage.SHOW_START_OF_BETTING_ROUND]]),
        [GameStage.SHOW_START_OF_BETTING_ROUND]: new Map([['TIMEOUT', this.isAllInRunOutCondition]]),
        [GameStage.WAITING_FOR_BET_ACTION]: new Map([
            // TODO unique case where timeout should execute action
            // ["TIMEOUT", GameStage.SHOW_BET_ACTION]
            [ActionType.BETACTION, GameStage.SHOW_BET_ACTION],
        ]),
        [GameStage.SHOW_BET_ACTION]: new Map([['TIMEOUT', this.isBettingRoundOverCondition]]),
        [GameStage.SHOW_PLACE_BETS_IN_POT]: new Map([['TIMEOUT', this.isHandGamePlayOverCondition]]),
        [GameStage.SHOW_WINNER]: new Map([['TIMEOUT', this.sidePotsRemainingCondition]]),
    };

    stageDelayMap: StageDelayMap = {
        [GameStage.NOT_IN_PROGRESS]: 0,
        [GameStage.INITIALIZE_NEW_HAND]: 250,
        [GameStage.SHOW_START_OF_HAND]: 400,
        [GameStage.SHOW_START_OF_BETTING_ROUND]: 750,
        [GameStage.WAITING_FOR_BET_ACTION]: 0,
        [GameStage.SHOW_BET_ACTION]: 200,
        [GameStage.SHOW_PLACE_BETS_IN_POT]: 600,
        [GameStage.SHOW_WINNER]: 2300,
    };

    getDelay(stage: GameStage) {
        return this.stageDelayMap[stage];
    }

    // TODO logic for getting edges that represent actions can be executed during any stage
    getEdge(eventType: EventType): GraphEdge {
        const gameStage = this.gameStateManager.getGameStage();
        const edge = this.stateGraph[gameStage].get(eventType);

        if (!!edge) {
            /* 
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

    getNextStage(eventType: EventType): GraphNode {
        let edge = this.getEdge(eventType);
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

    processCondition(condition: Condition): GraphEdge {
        return condition.fn() ? condition.TRUE : condition.FALSE;
    }

    /*
        MessageService receives the message, validates the action 
            (validation service will use stages to simplify validation)
        Executes the action if valid. After executing the action, messageService calls
        the stateUpdater's processEvent is triggered. Then, depending on state conditions,
        the stage is changed.

    */
    processEvent(event: EventType) {
        debugger;
        const nextStage = this.getNextStage(event);
        console.log('processEvent. event:', event, 'nextStage:', nextStage);
        // TODO once getEdge method is guaranteed to return non-null, you can remove this
        // guard from here and from getNextStage.
        if (!!nextStage) {
            this.initializeGameStage(nextStage);
        }
    }

    processTimeout() {
        this.processEvent('TIMEOUT');
    }

    startGameStageTransitionSequence() {}

    // The changes executed while entering a game stage should be general and applicable no matter
    // what path was taken to get to that stage. If there is logic that is specific to a path, then
    // that logic should be executed on the way to the stage.
    initializeGameStage(stage: GameStage) {
        this.gameStateManager.updateGameStage(stage);

        switch (stage) {
            case GameStage.INITIALIZE_NEW_HAND: {
                this.gameStateManager.clearStateOfRoundInfo();

                // TODO initializeBetting round actually goes into start of betting round
                // TODO trigger timer, look up delay from delay map

                break;
            }

            case GameStage.SHOW_START_OF_HAND: {
                break;
            }

            case GameStage.SHOW_START_OF_BETTING_ROUND: {
                this.gamePlayService.initializeBettingRound();

                break;
            }

            case GameStage.WAITING_FOR_BET_ACTION: {
                break;
            }

            case GameStage.SHOW_BET_ACTION: {
                break;
            }

            case GameStage.SHOW_PLACE_BETS_IN_POT: {
                break;
            }

            case GameStage.SHOW_WINNER: {
                break;
            }
        }

        const delay = this.getDelay(stage);
        console.log('delay:', delay);
        if (delay) {
            console.log('setting timer..');
            this.timerManager.setStateTimer(() => this.processTimeout(), delay);
        }
        // this.timerManager.setTimer()

        // change the stage
        // execute those stages changes
        // starttimer
        /*
            initialize new hand:
                - execute queued actions
            show start of hand:
                - finalize players in hand
                - update button
                - place blinds
            show start of betting round:
                - update bettingRoundStage
                - deal cards
            waiting for bet action:
                - update current player to act
            show bet action:
                - show action
            show place bets in pot:
                - coalesce pots
                - show bets going into pot
            show winner:
                - take first pot from list of pots
                - calculate winner of pot
                - give winner pot and show winner
        */
    }

    /*
    SHOW_STARTOF_BETTING_ROUND -> WAITINF_FOR_BET_ACTION
    SHOW_BET_ACTION -> WAITING_FOR_BET_ACTION

    in both cases we
    waiting_for_bet_action node can have logic that checks the betting round stage, and sets the
    current player to act accordingly



    SHOW_START_OF_HAND -> SHOW_START_OF_BETTING_ROUND
    SHOW_PLACE_BETS_IN_POT -> SHOW_START_OF_BETTING_ROUND

    in both cases we increment the betting round stage according to its current value
    we deal cards according to the betting roudn stage.
*/
}
