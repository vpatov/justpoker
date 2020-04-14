import { Service } from 'typedi';
import WebSocket from 'ws';
import { Player } from '../../../ui/src/shared/models/player';
import { ConnectedClient } from '../../../ui/src/shared/models/table';
import { generateUUID } from '../../../ui/src/shared/util/util';
import { BettingRoundActionType } from '../../../ui/src/shared/models/game';

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
            seatNumber: -1,
            lastActionType: BettingRoundActionType.NOT_IN_HAND,
            betAmount: 0,
            winner: false,
            cardsAreHidden: true,
        };
    }

    createConnectedClient(clientUUID: string, ws: WebSocket): ConnectedClient {
        return {
            uuid: clientUUID,
            playerUUID: '',
            ws,
        };
    }
}
