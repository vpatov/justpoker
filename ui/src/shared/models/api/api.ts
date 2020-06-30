import { GameParameters } from '../game/game';
import { BettingRoundAction } from '../game/betting';
import { Card } from '../game/cards';
import { GameInstanceUUID, ClientUUID, PlayerUUID } from '../system/uuid';
import { ReactionTrigger } from '../state/animationState';
import { AvatarKeys } from '../ui/assets';

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
    KEEPALIVE = 'KEEPALIVE',
}

export enum ServerActionType {
    TIMEOUT = 'TIMEOUT',
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
    RemoveAdminRequest;

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

export function createWSCloseEvent(gameInstanceUUID: GameInstanceUUID, clientUUID: ClientUUID): Event {
    return {
        eventType: EventType.SERVER_ACTION,
        body: {
            actionType: ServerActionType.WS_CLOSE,
            gameInstanceUUID,
            clientUUID,
        } as ServerAction,
    };
}
