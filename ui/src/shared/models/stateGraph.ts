import { GameStage } from './gameState';
import { ActionType } from './api';

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
