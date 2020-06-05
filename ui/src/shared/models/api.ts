import { BettingRoundAction, GameType, GameParameters } from './game';
import { Suit, Card } from './cards';
import { GameInstanceUUID, ClientUUID, PlayerUUID } from './uuid';
import { ReactionTrigger } from './animationState';
import { AvatarKeys } from './assets';

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
    gameInstanceUUID: GameInstanceUUID;
}
export declare interface ClientAction extends BaseAction {
    actionType: ClientActionType;
    clientUUID: ClientUUID;
    request: ClientWsMessageRequest;
}
export declare interface ServerAction extends BaseAction {
    actionType: ServerActionType;
}

export declare interface WSParams {
    clientUUID: ClientUUID;
    gameInstanceUUID: GameInstanceUUID;
}

export declare interface HTTPParams {
    gameInstanceUUID: GameInstanceUUID;
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
    REACTION = 'REACTION',
    SETGAMEPARAMETERS = 'SETGAMEPARAMETERS',
}

export enum ServerActionType {
    TIMEOUT = 'TIMEOUT',
}

export enum UiActionType {
    VOLUME = 'VOLUME',
    GAME_SETTINGS = 'GAME_SETTINGS',
    USER_SETTINGS = 'USER_SETTINGS',
    OPEN_LEDGER = 'OPEN_LEDGER',
}

export declare interface SitDownRequest {
    seatNumber: number;
    // waitForBlind: boolean;
}

export declare interface JoinTableRequest {
    name: string;
    buyin: number;
    avatarKey: AvatarKeys;
    // admin: boolean;
    // sitdown: boolean;
    // password?: string;
}

export declare interface AddChipsRequest {
    chipAmount: number;
}

export declare interface SetChipsRequest {
    chipAmount: number;
    playerUUID: PlayerUUID;
}

export declare interface ClientChatMessage {
    content: string;
}

export declare interface ClientStraddleRequest {
    willStraddle: boolean;
}

export declare interface BootPlayerRequest {
    playerUUID: PlayerUUID;
}

export declare interface ShowCardRequest {
    playerUUID: PlayerUUID;
    cards: Card[];
}

export declare interface PlayerReactionRequest {
    playerUUID: PlayerUUID;
    reaction: ReactionTrigger;
}

export declare interface SetGameParametersRequest {
    gameParameters: GameParameters;
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
    ShowCardRequest &
    PlayerReactionRequest &
    SetGameParametersRequest;

export declare interface ClientWsMessage {
    actionType: ClientActionType;
    request: ClientWsMessageRequest;
}

export function createTimeoutEvent(gameInstanceUUID: GameInstanceUUID): Event {
    return {
        eventType: EventType.SERVER_ACTION,
        body: {
            actionType: ServerActionType.TIMEOUT,
            gameInstanceUUID,
        } as ServerAction,
    };
}
