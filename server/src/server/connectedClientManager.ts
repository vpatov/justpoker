import { Service } from 'typedi';
import { StateConverter } from '../service/stateConverter';
import * as WebSocket from 'ws';
import { generateUUID } from '../../../ui/src/shared/util/util';

export interface ClientGroups {
    [gameInstanceUUID: string]: { [clientUUID: string]: WebSocket };
}

@Service()
export class ConnectedClientManager {
    private ClientGroups: ClientGroups = {};

    constructor(private stateConverter: StateConverter) {}

    createClientSessionInGroup(groupKey: string, ws: WebSocket): string {
        const clientUUID = generateUUID();
        if (!this.ClientGroups[groupKey]) {
            // create group if doesnt exist
            this.ClientGroups[groupKey] = { [clientUUID]: ws };
        } else {
            // add to group if exists
            this.ClientGroups[groupKey] = { ...this.ClientGroups[groupKey], [clientUUID]: ws };
        }
        return clientUUID;
    }

    createNewClientGroup(groupKey: string) {
        this.ClientGroups[groupKey] = {};
    }

    updateClientSessionInGroup(groupKey: string, clientUUID: string, ws: WebSocket) {
        this.ClientGroups[groupKey][clientUUID] = ws;
    }

    // would be good to refactor this so there isnt a direct dependency on stateConverter
    sendStateToEachInGroup(key: string) {
        Object.entries(this.ClientGroups[key]).forEach(([clientUUID, websocket]) => {
            const newState = this.stateConverter.getUIState(clientUUID, false);
            const jsonRes = JSON.stringify(newState);
            websocket.send(jsonRes);
        });
    }
}
