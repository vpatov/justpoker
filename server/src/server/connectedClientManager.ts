import { Service } from 'typedi';
import { StateConverter } from '../io/stateConverter';
import * as WebSocket from 'ws';
import { logger, debugFunc } from '../logger';
import { ClientUUID, GameInstanceUUID } from '../../../ui/src/shared/models/uuid';
// TODO when branded types are allowed to be used as index signatures, update this definition
export interface ClientGroups {
    [gameInstanceUUID: string]: { [clientUUID: string]: Client };
}

export interface Client {
    ws: WebSocket;
    lastSentState: Record<string, any>;
}

@Service()
export class ConnectedClientManager {
    private ClientGroups: ClientGroups = {};

    constructor(private stateConverter: StateConverter) {}

    getClientGroups(): ClientGroups {
        return this.ClientGroups;
    }

    addOrUpdateClientInGroup(gameInstanceUUID: GameInstanceUUID, clientUUID: ClientUUID, ws: WebSocket): boolean {
        if (this.ClientGroups[gameInstanceUUID]) {
            const client = this.ClientGroups[gameInstanceUUID][clientUUID];
            if (client) {
                // update ws if client exists
                client.ws = ws;
            } else {
                // create if client doesnt exist
                this.ClientGroups[gameInstanceUUID][clientUUID] = { ws: ws, lastSentState: {} };
            }

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
        const ws = this.ClientGroups[gameInstanceUUID]?.[clientUUID]?.ws;
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
            Object.values(this.ClientGroups[gameInstanceUUID]).forEach((client) => client.ws.close(1000)); // 1000 indicated normal close
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
        Object.entries(this.ClientGroups[gameInstanceUUID]).forEach(([clientUUID, client]) => {
            const newState = this.stateConverter.getUIState(clientUUID as ClientUUID, false);
            const jsonRes = JSON.stringify(newState);
            client.ws.send(jsonRes);
        });
    }
}
