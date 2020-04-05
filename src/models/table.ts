import { GameState, cleanGameState } from './gameState';
import { GameType } from './game';
import { Player } from './player';


/*
    table has:
    - spectators
    - connected players (with auth information)
    - game state (players dont have auth information)

    table will serve as intermediate layer between
    auth/connected players/websocket clients
    and actual gamestate players
*/

export declare interface Table {
    // gameState: GameState;

    uuid: string;

    // map the same person (by cookie) to the same connected client
    // this mapping is established upon their first connection to the table,
    // and for the host, established upon table creation.
    activeConnections: Map<string, ConnectedClient>;

    password: string;
    // adminOptions
}

// represents a person that has accessed the game via their browser.
// can be playing or not playing (spectating or in game).

export declare interface ConnectedClient {
    cookie: string;
    clientState: ClientState;
    gamePlayer: Player | null;
}

export const enum ClientState {
    INGAME = 'INGAME',
    SPECTATING = 'SPECTATING',
}

export declare interface NewTableForm {
    gameType: GameType;
    smallBlind: number;
    bigBlind: number;
    password?: string;
    adminOptions?: any;
}
