import { BettingRoundAction, GameType } from './game';

export declare interface ClientAction {
    actionType: ClientActionType;
    clientUUID: string;
    gameInstanceUUID: string;
    request: any;
}

export declare interface ServerAction {
    actionType: ServerActionType;
    gameInstanceUUID: string;
    request: any;
}

export declare type Event = ClientAction | ServerAction;
export declare type EventType = ClientActionType | ServerActionType;

export enum EndPoint {
    GAME = 'game',
    LEDGER = 'ledger',
}

export declare interface WSParams {
    clientUUID: string;
    gameInstanceUUID: string;
    endpoint: EndPoint;
}

export declare interface HTTPParams {
    gameInstanceUUID: string;
}

export enum ClientActionType {
    STARTGAME = 'STARTGAME',
    STOPGAME = 'STOPGAME',
    SITDOWN = 'SITDOWN',
    STANDUP = 'STANDUP',
    SITIN = 'SITIN',
    SITOUT = 'SITOUT',
    JOINTABLE = 'JOINTABLE',
    JOINTABLEANDSITDOWN = 'JOINTABLEANDSITDOWN',
    PINGSTATE = 'PINGSTATE',
    CHAT = 'CHAT',
    ADDCHIPS = 'ADDCHIPS',
    SETCHIPS = 'SETCHIPS',
    BETACTION = 'BETACTION',
    SETPLAYERSTRADDLE = 'SETPLAYERSTRADDLE',
    BOOTPLAYER = 'BOOTPLAYER',
    LEAVETABLE = 'LEAVETABLE',
    USETIMEBANK = 'USETIMEBANK',
}

export enum ServerActionType {
    TIMEOUT = 'TIMEOUT',
}

export enum UiActionType {
    VOLUME = 'VOLUME',
    SETTINGS = 'SETTINGS',
    ADMIN = 'ADMIN',
    OPEN_LEDGER = 'OPEN_LEDGER',
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

export declare interface ClientStraddleRequest {
    willStraddle: boolean;
}

export declare interface BootPlayerRequest {
    playerUUID: string;
}

export type ClientWsMessageRequest = SitDownRequest &
    JoinTableRequest &
    (SitDownRequest & JoinTableRequest) &
    BettingRoundAction &
    AddChipsRequest &
    SetChipsRequest &
    ClientStraddleRequest &
    ClientChatMessage &
    BootPlayerRequest;

export declare interface ClientWsMessage {
    actionType: ClientActionType;
    request: ClientWsMessageRequest;
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
