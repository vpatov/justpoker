import { GameType } from "./game";
import { PlayerUUID } from "./player";
import WebSocket from "ws";

export declare type ClientUUID = string;
export declare type TableUUID = string;

export declare interface Table {
    readonly uuid: TableUUID;
    readonly activeConnections: Map<ClientUUID, ConnectedClient>;
    readonly password: string;
    readonly admin: string;
}

// represents a person that has accessed the game via their browser.
// can be playing or not playing (spectating or in game).
export declare interface ConnectedClient {
    readonly uuid: ClientUUID;
    readonly playerUUID: PlayerUUID;
    ws: WebSocket;
}

export declare interface NewGameForm {
    gameType: GameType;
    smallBlind: number;
    bigBlind: number;
    maxBuyin: number;
    timeToAct: number;
    password?: string;
    adminOptions?: any;
}