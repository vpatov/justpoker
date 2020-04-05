import { Service } from "typedi";
import { Player } from '../models/player';
import { generateUUID } from '../util/util';
import { BehaviorSubject, Observable } from 'rxjs';

@Service()
export class PlayerService {

    createNewPlayer(name: string, chips: number): Player {
        return {
            name,
            chips,
            holeCards: [],
            sitting: false,
            uuid: generateUUID()
        };
    }

    // TODO determine if usage of redux style object spread is anti-pattern here
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

