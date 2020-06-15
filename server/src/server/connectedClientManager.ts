import { Service } from 'typedi';
import { StateConverter } from '../io/stateConverter';
import * as WebSocket from 'ws';
import { logger, debugFunc } from '../logger';
import { ClientUUID, GameInstanceUUID } from '../../../ui/src/shared/models/system/uuid';

// TODO when branded types are allowed to be used as index signatures, update this definition
export interface ClientGroups {
    [gameInstanceUUID: string]: { [clientUUID: string]: WebSocket };
}

@Service()
export class ConnectedClientManager {
    private ClientGroups: ClientGroups = {};

    constructor(private stateConverter: StateConverter) {}

    addOrUpdateClientInGroup(gameInstanceUUID: GameInstanceUUID, clientUUID: ClientUUID, ws: WebSocket): boolean {
        if (this.ClientGroups[gameInstanceUUID]) {
            // add to group if exists
            this.ClientGroups[gameInstanceUUID][clientUUID] = ws;
            return true;
        }
        // group does not exist
        return false;
    }

    createNewClientGroup(gameInstanceUUID: GameInstanceUUID) {
        this.ClientGroups[gameInstanceUUID] = {};
    }

    @debugFunc()
    removeClientFromGroup(gameInstanceUUID: GameInstanceUUID, clientUUID: ClientUUID): boolean {
        const ws = this.ClientGroups[gameInstanceUUID]?.[clientUUID];
        if (ws) {
            // remove from group if is in group
            ws.close(1000); // close if not already closed, 1000 indicated normal close
            delete this.ClientGroups[gameInstanceUUID][clientUUID];
            return true;
        }
        // group or client does not exist
        return false;
    }

    removeGroupFromManager(gameInstanceUUID: GameInstanceUUID): boolean {
        logger.verbose(`removing group ${gameInstanceUUID}`);
        if (this.ClientGroups[gameInstanceUUID]) {
            // close all websockets
            Object.values(this.ClientGroups[gameInstanceUUID]).forEach((ws) => ws.close(1000)); // 1000 indicated normal close
            // remove group if group exists
            delete this.ClientGroups[gameInstanceUUID];
        }
        // group does not exist
        return false;
    }

    // If groups can be something other than gameInstances, it might be helpful to have typed
    // helper methods for each group type. (different UUID types will have actual unique types in future)
    sendStateToEachInGameInstance(gameInstanceUUID: GameInstanceUUID) {
        this.sendStateToEachInGroup(gameInstanceUUID);
    }

    // would be good to refactor this so there isnt a direct dependency on stateConverter
    sendStateToEachInGroup(gameInstanceUUID: GameInstanceUUID) {
        Object.entries(this.ClientGroups[gameInstanceUUID]).forEach(([clientUUID, websocket]) => {
            const newState = this.stateConverter.getUIState(clientUUID as ClientUUID, false);
            const jsonRes = JSON.stringify(newState);
            websocket.send(jsonRes);
        });
    }
}
