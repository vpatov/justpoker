import { Service } from 'typedi';
import {
    Condition,
    StateGraph,
    Event,
    Action,
    Timeout,
    EventType,
    GraphNode,
    GraphEdge,
    instanceOfCondition,
} from '../../../ui/src/shared/models/stateGraph';
import { GameStage } from '../../../ui/src/shared/models/gameState';
import { ActionType } from '../../../ui/src/shared/models/wsaction';
import { GameStateManager } from './gameStateManager';

@Service()
export class StateUpdateService {
    constructor(private readonly gameStateManager: GameStateManager) {}

    canContinueGameCondition: Condition = {
        // fn -> # players sitting in >= 2 && shouldDealNextHand
        fn: () => true,
        TRUE: GameStage.INITIALIZE_NEW_HAND,
        FALSE: GameStage.NOT_IN_PROGRESS,
    };

    isHandGamePlayOverCondition: Condition = {
        // everyoneFolded || timeForShowdown
        fn: () => true,
        TRUE: GameStage.SHOW_WINNER,
        FALSE: GameStage.SHOW_START_OF_BETTING_ROUND,
    };

    isAllInRunOutCondition: Condition = {
        // fn -> #playersAllIn >= playersInHand - 1
        fn: () => true,
        TRUE: this.isHandGamePlayOverCondition,
        FALSE: GameStage.WAITING_FOR_BET_ACTION,
    };

    isBettingRoundOverCondition: Condition = {
        // fn -> hasEveryoneActed
        fn: () => true,
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
        while (instanceOfCondition(edge)) {
            edge = this.processCondition(edge);
        }
        return edge;
    }

    processCondition(condition: Condition): GraphEdge {
        return condition.fn() ? condition.TRUE : condition.FALSE;
    }

    /*
        This method will only process actions that can potentially change the gameStage. Other
        actions will be directly executed by the messageService. For example, users can chat, add chips,
        stand up, sit out, and update their name during any gameStage. These actions cannot directly 
        affect the stage transition, so the messageService will handle them, and will send actions like
        SITDOWN, STARTGAME, SITIN, BETACTION to this module. Once queuing is implemented, then actions
        like ADDCHIPS and UPDATEGAMEPARAMS will also be sent to this module.
    */
    processAction(action: Action) {
        // validate action
        // if action is valid, execute.
        // getNextStage and transition to the next stage (even if the stage is the same).
        // TODO queue or discard

        const nextStage = this.getNextStage(action.actionType);
    }

    processTimerEvent() {
        const nextStage = this.getNextStage('TIMEOUT');
    }

    startGameStageTransitionSequence() {}

    // The changes executed while entering a game stage should be general and applicable no matter
    // what path was taken to get to that stage. If there is logic that is specific to a path, then
    // that logic should be executed on the way to the stage.
    updateGameStage(stage: GameStage) {
        // change the stage
        // execute those stages changes
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
