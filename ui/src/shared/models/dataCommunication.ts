import { BettingRoundAction, GameType } from './game';
import { Suit, Card } from './cards';

export enum EventType {
    SERVER_ACTION = 'SERVER_ACTION',
    CLIENT_ACTION = 'CLIENT_ACTION',
}

export declare type EventBody = ClientAction | ServerAction;
export declare interface Event {
    eventType: EventType;
    body: EventBody;
}
export declare type ActionType = ClientActionType | ServerActionType;
export declare interface BaseAction {
    actionType: ActionType;
    gameInstanceUUID: string;
}
export declare interface ClientAction extends BaseAction {
    actionType: ClientActionType;
    clientUUID: string;
    request: ClientWsMessageRequest;
}
export declare interface ServerAction extends BaseAction {
    actionType: ServerActionType;
}

export declare interface WSParams {
    clientUUID: string;
    gameInstanceUUID: string;
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
    SHOWCARD = 'SHOWCARD',
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

export declare interface ShowCardRequest {
    playerUUID: string;
    cards: Card[];
}

export type ClientWsMessageRequest = SitDownRequest &
    JoinTableRequest &
    (SitDownRequest & JoinTableRequest) &
    BettingRoundAction &
    AddChipsRequest &
    SetChipsRequest &
    ClientStraddleRequest &
    ClientChatMessage &
    BootPlayerRequest &
    ShowCardRequest;

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

export function createTimeoutEvent(gameInstanceUUID: string): Event {
    return {
        eventType: EventType.SERVER_ACTION,
        body: {
            actionType: ServerActionType.TIMEOUT,
            gameInstanceUUID,
        } as ServerAction,
    };
}
