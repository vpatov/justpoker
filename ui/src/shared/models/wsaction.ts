import { BettingRoundAction } from "../models/game";

export enum ActionType {
    STARTGAME = "STARTGAME",
    STOPGAME = "STOPGAME",
    SITDOWN = "SITDOWN",
    STANDUP = "STANDUP",
    JOINTABLE = "JOINTABLE",
    JOINTABLEANDSITDOWN = "JOINTABLEANDSITDOWN",
    PINGSTATE = "PINGSTATE",
    CHECK = "CHECK",
    BET = "BET",
    FOLD = "FOLD",
    CALL = "CALL",
    CHAT = "CHAT",
    ADDCHIPS = "ADDCHIPS",
    SETCHIPS = "SETCHIPS",
}

export declare interface SitDownRequest {
    seatNumber: number;
    // waitForBlind: boolean;
}

export declare interface JoinTableRequest {
    name: string;
    buyin: number;
    // admin: boolean;
    // sitdown: boolean;
    // password?: string;
}

export declare interface AddChipsRequest {
    chipAmount: number;
}

export declare interface SetChipsRequest {
    chipAmount: number;
    playerUUID: string;
}

export declare interface ClientChatMessage {
    content: string;
}

export type ClientWsMessageRequest = SitDownRequest &
    JoinTableRequest &
    (SitDownRequest & JoinTableRequest) &
    BettingRoundAction &
    AddChipsRequest &
    SetChipsRequest &
    ClientChatMessage;

export declare interface ClientWsMessage {
    actionType: ActionType;
    request: ClientWsMessageRequest;
}
