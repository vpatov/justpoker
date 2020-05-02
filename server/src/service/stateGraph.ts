import { Service } from 'typedi';
import { GameStage } from '../../../ui/src/shared/models/gameState';
import { ActionType } from '../../../ui/src/shared/models/wsaction';

declare interface Condition {}

declare type Node = GameStage;
declare type Edge = Condition | Node;
declare type EventType = ActionType | Timeout;
declare type Timeout = 'TIMEOUT';
declare type Graph = { [key in Node]: Map<EventType, Edge> };

function canContinueGame(): Edge {
    // if sitting in >= 2 and shouldDealNextHand, canContinueGame
    return GameStage.INITIALIZE_NEW_HAND;
}

const graph: Graph = {
    [GameStage.NOT_IN_PROGRESS]: new Map([
        [ActionType.STARTGAME, canContinueGame],
        [ActionType.SITDOWN, canContinueGame],
        [ActionType.SITIN, canContinueGame],
    ]),
    [GameStage.INITIALIZE_NEW_HAND]: new Map(),
    [GameStage.SHOW_START_OF_HAND]: new Map(),
    [GameStage.SHOW_START_OF_BETTING_ROUND]: new Map(),
    [GameStage.WAITING_FOR_BET_ACTION]: new Map(),
    [GameStage.SHOW_BET_ACTION]: new Map(),
    [GameStage.SHOW_PLACE_BETS_IN_POT]: new Map(),
    [GameStage.SHOW_WINNER]: new Map(),
};

@Service()
export class StateGraph {
    // question: initialize graph through source or by reading from file?
    initGraph() {
        // graph.set(GameStage.NOT_IN_PROGRESS)
    }

    processAction() {}

    processTimerEvent() {}

    startGameStageTransitionSequence() {}

    transitionToNextGameStage() {}

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
