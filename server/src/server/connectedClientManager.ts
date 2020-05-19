import { Service } from 'typedi';
import { StateConverter } from '../service/stateConverter';
import * as WebSocket from 'ws';

export interface ClientGroups {
    [gameInstanceUUID: string]: { [clientUUID: string]: WebSocket };
}

@Service()
export class ConnectedClientManager {
    private ClientGroups: ClientGroups = {};

    constructor(private stateConverter: StateConverter) {}

    addToGroup(key: string, clientUUID: string, ws: WebSocket) {
        // create group and add client if there is none
        if (!this.ClientGroups[key]) {
            this.ClientGroups[key] = { [clientUUID]: ws };
        } else {
            // otherwise add client to group and assign ws
            // this will also replace broken ws for existing clients
            this.ClientGroups[key][clientUUID] = ws;
        }
        console.log(this.ClientGroups);
    }

    // would be good to refactor this so there isnt a direct dependency on stateConverter
    sendStateToEachInGroup(key: string) {
        Object.entries(this.ClientGroups[key]).forEach(([clientUUID, websocket]) => {
            console.log(clientUUID, websocket);

            const newState = this.stateConverter.getUIState(clientUUID, false);
            const jsonRes = JSON.stringify(newState);
            websocket.send(jsonRes);
        });
    }
}
