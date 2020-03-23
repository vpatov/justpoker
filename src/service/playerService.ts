import { Service } from "typedi";
import { Player } from '../models/player';
import { BehaviorSubject, Observable } from 'rxjs';

@Service()
class PlayerService {

    connectedPlayers = new BehaviorSubject<Map<string, Player>>(new Map());


    async createNewPlayer(name: string) {

        const players = await this.connectedPlayers.getValue();

        let uuid = this.generateUUID();
        while (players.has(uuid)) {
            uuid = this.generateUUID();
        }
        const newPlayer = {
            name,
            uuid,
        };
        players.set(uuid, newPlayer);
        this.connectedPlayers.next(players);
        return newPlayer;
    }

    generateUUID() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
}

