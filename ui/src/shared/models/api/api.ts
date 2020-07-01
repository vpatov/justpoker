import { GameParameters } from '../game/game';
import { BettingRoundAction } from '../game/betting';
import { Card } from '../game/cards';
import { GameInstanceUUID, ClientUUID, PlayerUUID } from '../system/uuid';
import { ReactionTrigger } from '../state/animationState';
import { AvatarKeys } from '../ui/assets';
import { ServerMessageType } from '../state/chat';

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
    clientUUID?: ClientUUID;
    serverMessageType?: ServerMessageType;
}

export declare interface HTTPParams {
    gameInstanceUUID: GameInstanceUUID;
}

export enum ClientActionType {
    STARTGAME = 'STARTGAME',
    STOPGAME = 'STOPGAME',
    SITIN = 'SITIN',
    SITOUT = 'SITOUT',
    JOINGAME = 'JOINGAME',
    JOINTABLE = 'JOINTABLE',
    JOINGAMEANDJOINTABLE = 'JOINGAMEANDJOINTABLE',
    PINGSTATE = 'PINGSTATE',
    CHAT = 'CHAT',
    BUYCHIPS = 'BUYCHIPS',
    SEATCHANGE = 'SEATCHANGE',
    SETCHIPS = 'SETCHIPS',
    BETACTION = 'BETACTION',
    SETPLAYERSTRADDLE = 'SETPLAYERSTRADDLE',
    BOOTPLAYER = 'BOOTPLAYER',
    LEAVETABLE = 'LEAVETABLE',
    QUITGAME = 'QUITGAME',
    USETIMEBANK = 'USETIMEBANK',
    SHOWCARD = 'SHOWCARD',
    REACTION = 'REACTION',
    SETGAMEPARAMETERS = 'SETGAMEPARAMETERS',
    ADDADMIN = 'ADDADMIN',
    REMOVEADMIN = 'REMOVEADMIN',
    CHANGEAVATAR = 'CHANGEAVATAR',
    KEEPALIVE = 'KEEPALIVE',
}

export enum ServerActionType {
    GAMEPLAY_TIMEOUT = 'TIMEOUT',
    SEND_MESSAGE = 'SEND_MESSAGE',
    WS_CLOSE = 'WS_CLOSE',
}

export enum UiActionType {
    VOLUME = 'VOLUME',
    GAME_SETTINGS = 'GAME_SETTINGS',
    USER_SETTINGS = 'USER_SETTINGS',
    OPEN_LEDGER = 'OPEN_LEDGER',
    OPEN_ADD_CHIPS = 'OPEN_ADD_CHIPS',
}

export declare interface JoinTableRequest {
    playerUUID: PlayerUUID;
    seatNumber: number;
}

export declare interface SeatChangeRequest {
    seatNumber: number;
}

export declare interface JoinGameRequest {
    name: string;
    buyin: number;
    avatarKey: AvatarKeys;
}

export declare type JoinGameAndTableRequest = JoinTableRequest & JoinGameRequest;

// for players, queuing
export declare interface BuyChipsRequest {
    chipAmount: number;
    playerUUID: PlayerUUID;
}

// for admins, non-queuing
export declare interface SetChipsRequest {
    chipAmount: number;
    playerUUID: PlayerUUID;
}

export declare interface AddAdminRequest {
    playerUUID: PlayerUUID;
}

export declare interface RemoveAdminRequest {
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

export declare interface ChangeAvatarRequest {
    playerUUID: PlayerUUID;
    avatarKey: AvatarKeys;
}

export type ClientWsMessageRequest = JoinTableRequest &
    JoinGameRequest &
    JoinTableRequest &
    BettingRoundAction &
    BuyChipsRequest &
    SetChipsRequest &
    ClientStraddleRequest &
    ClientChatMessage &
    BootPlayerRequest &
    ShowCardRequest &
    PlayerReactionRequest &
    SetGameParametersRequest &
    AddAdminRequest &
    RemoveAdminRequest &
    ChangeAvatarRequest;

export declare interface ClientWsMessage {
    actionType: ClientActionType;
    request: ClientWsMessageRequest;
}

export function createServerMessageEvent(
    gameInstanceUUID: GameInstanceUUID,
    serverMessageType: ServerMessageType,
): Event {
    const body: ServerAction = {
        actionType: ServerActionType.SEND_MESSAGE,
        gameInstanceUUID,
        serverMessageType,
    };
    return {
        eventType: EventType.SERVER_ACTION,
        body,
    };
}

export function createTimeoutEvent(gameInstanceUUID: GameInstanceUUID): Event {
    const body: ServerAction = {
        actionType: ServerActionType.GAMEPLAY_TIMEOUT,
        gameInstanceUUID,
    };
    return {
        eventType: EventType.SERVER_ACTION,
        body,
    };
}

export function createWSCloseEvent(gameInstanceUUID: GameInstanceUUID, clientUUID: ClientUUID): Event {
    const body: ServerAction = {
        actionType: ServerActionType.WS_CLOSE,
        gameInstanceUUID,
        clientUUID,
    };
    return {
        eventType: EventType.SERVER_ACTION,
        body,
    };
}
