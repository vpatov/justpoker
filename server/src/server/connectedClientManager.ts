import { Service } from 'typedi';
import { StateConverter } from '../io/stateConverter';
import * as WebSocket from 'ws';
import { logger, debugFunc } from '../logger';
import { ClientUUID, GameInstanceUUID } from '../../../ui/src/shared/models/system/uuid';
import { getEpochTimeMs } from '../../../ui/src/shared/util/util';

// TODO when branded types are allowed to be used as index signatures, update this definition
export interface ClientGroups {
    [gameInstanceUUID: string]: { [clientUUID: string]: Client };
}

export interface Client {
    ws: WebSocket;
    lastMessaged: number;
}

const EXPIRE_CLIENT_TIME = 1000 * 12; // expire games after 15 min of inactivity

@Service()
export class ConnectedClientManager {
    private ClientGroups: ClientGroups = {};

    constructor(private stateConverter: StateConverter) {
        setInterval(() => this.clearStaleClients(), 1000); // attempt to expire clients every 20 minutes
    }

    getClientGroups(): ClientGroups {
        return this.ClientGroups;
    }

    setClientTimeMessaged(gameInstanceUUID: GameInstanceUUID, clientUUID: ClientUUID) {
        this.ClientGroups[gameInstanceUUID][clientUUID].lastMessaged = getEpochTimeMs();
    }

    clearStaleClients() {
        logger.info(`attempting to expiring game instances`);
        if (this.ClientGroups) {
            // TODO implement warning game will be cleared do to inactivity
            const now = getEpochTimeMs();
            Object.entries(this.ClientGroups).forEach(([gameInstanceUUID, clients]) => {
                Object.entries(clients).forEach(([clientUUID, client]) => {
                    const timeInactive = now - client.lastMessaged;
                    logger.info(`${clientUUID} in game ${gameInstanceUUID} has been inactive for ${timeInactive}`);
                    if (timeInactive > EXPIRE_CLIENT_TIME) {
                        logger.info(`expiring game instance ${gameInstanceUUID}`);
                        this.removeClientFromGroup(gameInstanceUUID as GameInstanceUUID, clientUUID as ClientUUID);
                    }
                });
            });
        }
    }

    addOrUpdateClientInGroup(gameInstanceUUID: GameInstanceUUID, clientUUID: ClientUUID, ws: WebSocket): boolean {
        if (this.ClientGroups[gameInstanceUUID]) {
            const client = this.ClientGroups[gameInstanceUUID][clientUUID];
            if (client) {
                // update ws if client exists
                client.ws = ws;
            } else {
                // create if client doesnt exist
                this.ClientGroups[gameInstanceUUID][clientUUID] = { ws: ws, lastMessaged: getEpochTimeMs() };
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
