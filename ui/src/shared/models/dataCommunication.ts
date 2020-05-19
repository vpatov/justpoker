import { BettingRoundAction } from './game';

export declare interface NewEvent {
    actionType: GeneralAction;
    request: any;
    gameInstanceUUID: string;
}

export declare type GeneralAction = ClientAction | ServerAction;

export enum EndPoint {
    GAME = 'game',
    LEDGER = 'ledger',
}

export declare interface WSParams {
    clientUUID: string;
    gameUUID: string;
    endpoint: EndPoint;
}

export declare interface HTTPParams {
    gameUUID: string;
}

export enum ActionType {
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

export enum ClientAction {
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

export enum ServerAction {
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
    actionType: ActionType;
    request: ClientWsMessageRequest;
}
