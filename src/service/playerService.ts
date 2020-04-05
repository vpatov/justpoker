import { Service } from "typedi";
import { Player } from '../models/player';
import { generateUUID } from '../util/util';
import { BehaviorSubject, Observable } from 'rxjs';

@Service()
export class PlayerService {


    /*
    connectedPlayers = new BehaviorSubject<Map<string, Player>>(new Map());

    async createNewPlayer1(name: string) {

        const players = await this.connectedPlayers.getValue();

        let uuid = generateUUID();
        while (players.has(uuid)) {
            uuid = generateUUID();
        }
        const newPlayer = {
            name,
            uuid,
        };
        players.set(uuid, newPlayer);
        this.connectedPlayers.next(players);
        return newPlayer;
    }
    */

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

