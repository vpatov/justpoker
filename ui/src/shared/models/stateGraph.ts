import { GameStage } from './gameState';
import { ActionType, ClientWsMessage } from './dataCommunication';

export declare interface Condition {
    fn: () => boolean;
    TRUE: GraphEdge;
    FALSE: GraphEdge;
}

export declare type Event = Action | Timeout;
export declare type Action = ClientWsMessage;
export declare type EventType = ActionType | Timeout;
export declare type Timeout = 'TIMEOUT';

// Graph
export declare type GraphNode = GameStage;
export declare type GraphEdge = Condition | GraphNode;
export declare type StateGraph = { [key in GraphNode]: Map<EventType, GraphEdge> };
export declare type StageDelayMap = {[key in GraphNode]: number};

export function instanceOfAction(object: any): object is Action {
    return 'actionType' in object;
}

export function instanceOfCondition(edge: GraphEdge): edge is Condition{
    return (typeof edge === 'object' && 'fn' in edge && 'TRUE' in edge && 'FALSE' in edge);
}