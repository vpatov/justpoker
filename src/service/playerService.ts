import { Service } from "typedi";
import { Player } from '../models/player';
import { generateUUID } from '../util/util';
import { BehaviorSubject, Observable } from 'rxjs';

// TODO design functions here such that they receive as input
// the players object, and return as output the players object

@Service()
export class PlayerService {

    createNewPlayer(name: string, chips: number): Player {
        return {
            name,
            chips,
            holeCards: [],
            sitting: false,
            inHand: false,
            lastAction: null,
            seatNumber: -1,
            uuid: generateUUID()
        };
    }


    // TODO validations
    /*
    addPlayerChips(player: Player, amount: number) {
        return {
            ...player,
            chips: player.chips + amount
        };
    }


    sitPlayerDown(player: Player) {
        return {
            ...player,
            sitting: true
        };
    }
    */
}

