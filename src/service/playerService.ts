import { Service } from "typedi";
import { Player } from '../models/player';
import { ConnectedClient } from '../models/table';
import { generateUUID } from '../util/util';

// TODO design functions here such that they receive as input
// the players object, and return as output the players object

@Service()
export class PlayerService {

    createNewPlayer(name: string, chips: number): Player {
        return {
            uuid: generateUUID(),
            name,
            chips,
            holeCards: [],
            sitting: false,
            inHand: false,
            seatNumber: -1,
            lastAction: null,
        };
    }

    createConnectedClient(clientUUID: string): ConnectedClient {
        return {
            uuid: clientUUID,
            playerUUID: ''
        };
    }

}
