import { Service } from 'typedi';
import { StateConverter } from '../service/stateConverter';
import * as WebSocket from 'ws';

export interface ClientGroups {
    [gameInstanceUUID: string]: { websocket: WebSocket; clientUUID: string }[];
}

@Service()
export class ConnectedClientManager {
    private ClientGroups: ClientGroups = {};

    constructor(private stateConverter: StateConverter) {}

    addToGroup(key: string, clientUUID: string, ws: WebSocket) {
        if (!this.ClientGroups[key]) {
            this.ClientGroups[key] = [{ websocket: ws, clientUUID: clientUUID }];
        }
        this.ClientGroups[key].push({ websocket: ws, clientUUID: clientUUID });
    }

    sendToGroup(key: string, data: any, transformer: (data: any, clientUUID: string) => any) {
        this.ClientGroups[key].forEach((c) => {
            const newState = transformer(data, c.clientUUID);
            c.websocket.send(newState);
        });
    }

    sendStateToEachInGroup(key: string) {
        this.ClientGroups[key].forEach((client) => {
            const newState = this.stateConverter.getUIState(client.clientUUID, false);
            const jsonRes = JSON.stringify(newState);
            console.log('sending state to ', client.clientUUID, newState);

            client.websocket.send(jsonRes);
        });
    }
}
