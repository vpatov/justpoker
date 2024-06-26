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
    INIT_HAND = 'INIT_HAND',
    SHOW_START_OF_BETTING_ROUND = 'SHOW_START_OF_BETTING_ROUND',
    WAITING_FOR_BET_ACTION = 'WAITING_FOR_BET_ACTION',
    SHOW_BET_ACTION = 'SHOW_BET_ACTION',
    FINISH_BETTING_ROUND = 'FINISH_BETTING_ROUND',
    SHOW_WINNER = 'SHOW_WINNER',
    POST_HAND_CLEANUP = 'POST_HAND_CLEANUP',
    SET_CURRENT_PLAYER_TO_ACT = 'SET_CURRENT_PLAYER_TO_ACT',
}

export const INIT_HAND_STAGES = [GameStage.INIT_HAND, GameStage.SHOW_START_OF_BETTING_ROUND];
