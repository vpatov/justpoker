import { BettingRoundAction } from "../models/game";

export enum ActionType {
    STARTGAME = "STARTGAME",
    STOPGAME = "STOPGAME",
    SITDOWN = "SITDOWN",
    STANDUP = "STANDUP",
    SITIN = "SITIN",
    SITOUT = "SITOUT",
    DEAL_IN_NEXT_HAND = "DEAL_IN_NEXT_HAND",
    DEAL_OUT_NEXT_HAND = "DEAL_OUT_NEXT_HAND",
    JOINTABLE = "JOINTABLE",
    JOINTABLEANDSITDOWN = "JOINTABLEANDSITDOWN",
    PINGSTATE = "PINGSTATE",
    CHAT = "CHAT",
    ADDCHIPS = "ADDCHIPS",
    SETCHIPS = "SETCHIPS",
    BETACTION = "BETACTION"
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
