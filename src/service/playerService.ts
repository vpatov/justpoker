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
            sitting: false
        };
    }

    // TODO determine if usage of redux style object spread is anti-pattern here
    addPlayerChips(player: Player, amount: number) {
        return {
            ...player,
            chips: player.chips + amount
        };
    }
}

