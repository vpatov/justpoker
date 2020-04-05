import { SecureGameState, cleanSecureGameState } from './gameState';
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
    secureGameState: SecureGameState;

    // map the same person (by cookie) to the same connected client
    // this mapping is established upon their first connection to the table,
    // and for the host, established upon table creation.
    activeConnections: Map<string, ConnectedClient>;
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

export const cleanTable: Table = {
    secureGameState: cleanSecureGameState,
    activeConnections: new Map(),
};