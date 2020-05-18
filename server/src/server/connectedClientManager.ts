import { Service } from 'typedi';

export interface ClientGroups {
    [gameInstanceUUID: string]: { websocket: WebSocket; clientUUID: string }[];
}

@Service()
export class ConnectedClientManager {
    private ClientGroups: ClientGroups = {};

    addToGroup(key: string, websocket: WebSocket, clientUUID: string) {
        if (!this.ClientGroups[key]) {
            this.ClientGroups[key] = [{ websocket, clientUUID }];
        }
        this.ClientGroups[key].push({ websocket, clientUUID });
    }

    sendToGroup(key: string, data: any, transformer: (data: any, clientUUID: string) => any) {
        this.ClientGroups[key].forEach((c) => {
            const newState = transformer(data, c.clientUUID);
            c.websocket.send(newState);
        });
    }
}
