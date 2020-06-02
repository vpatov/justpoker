import { Service } from 'typedi';
import { StateConverter } from '../service/stateConverter';
import * as WebSocket from 'ws';
import { generateUUID } from '../../../ui/src/shared/util/util';
import { logger, debugFunc } from '../logger';
import { ClientUUID, GameInstanceUUID, generateClientUUID } from '../../../ui/src/shared/models/uuid';

// TODO when branded types are allowed to be used as index signatures, update this definition
export interface ClientGroups {
    [gameInstanceUUID: string]: { [clientUUID: string]: WebSocket };
}

@Service()
export class ConnectedClientManager {
    private ClientGroups: ClientGroups = {};

    constructor(private stateConverter: StateConverter) {}

    @debugFunc({ noArgs: true })
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

    // @debugFunc({ noArgs: true })
    // updateClientSessionInGroup(gameInstanceUUID: GameInstanceUUID, clientUUID: ClientUUID, ws: WebSocket) {
    //     if (this.ClientGroups[gameInstanceUUID]) {
    //         this.ClientGroups[gameInstanceUUID][clientUUID] = ws;
    //     }
    //     // TODO error, there is no group
    // }

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
