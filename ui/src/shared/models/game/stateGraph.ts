import { ActionType } from '../api/api';

export declare interface Condition {
    fn: () => boolean;
    TRUE: GraphEdge;
    FALSE: GraphEdge;
}

// Graph
export declare type GraphNode = GameStage;
export declare type GraphEdge = Condition | GraphNode;

export declare type StateGraph = { [key in GraphNode]: Map<ActionType, GraphEdge> };
export declare type StageDelayMap = { [key in GraphNode]: number };

export function instanceOfCondition(edge: GraphEdge): edge is Condition {
    return typeof edge === 'object' && 'fn' in edge && 'TRUE' in edge && 'FALSE' in edge;
}

export const enum GameStage {
    NOT_IN_PROGRESS = 'NOT_IN_PROGRESS',
    INITIALIZE_NEW_HAND = 'INITIALIZE_NEW_HAND',
    SHOW_START_OF_HAND = 'SHOW_START_OF_HAND',
    SHOW_START_OF_BETTING_ROUND = 'SHOW_START_OF_BETTING_ROUND',
    WAITING_FOR_BET_ACTION = 'WAITING_FOR_BET_ACTION',
    SHOW_BET_ACTION = 'SHOW_BET_ACTION',
    FINISH_BETTING_ROUND = 'FINISH_BETTING_ROUND',
    SHOW_WINNER = 'SHOW_WINNER',
    POST_HAND_CLEANUP = 'EJECT_STACKED_PLAYERS',
}

export const INIT_HAND_STAGES = [GameStage.SHOW_START_OF_HAND, GameStage.SHOW_START_OF_BETTING_ROUND];
