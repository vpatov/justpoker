import { Service } from "typedi";
import { Player } from '../models/player';
import { generateUUID } from '../util/util';
import { BehaviorSubject, Observable } from 'rxjs';

@Service()
export class PlayerService {

    connectedPlayers = new BehaviorSubject<Map<string, Player>>(new Map());


    async createNewPlayer(name: string) {

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

    /*
        Upon loading the frontend app, frontend looks up our cookie.
        1) If it can't find it, it creates a new WSconnection and cookie
        2) If it finds it, it reuses the cookie and WSconnects with it.

        It is probably best to make the code path for creating a websocket
        connection the same, regardless of whether client is host creating
        a table, or someone else joining existing table.

        Therefore, post request for new table should generate
        a table ID and url.
    */
    async createNewConnectedClient() {

    }
}

