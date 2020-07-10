import get from 'lodash/get';
import docCookies from './cookies';
import queryString, { ParsedQuery } from 'query-string';
import {
    ClientWsMessage,
    ClientChatMessage,
    ClientActionType,
    ClientWsMessageRequest,
    BootPlayerRequest,
    AddAdminRequest,
    RemoveAdminRequest,
    JoinGameRequest,
    SetChipsRequest,
    JoinTableRequest,
    BuyChipsRequest,
    SeatChangeRequest,
    ChangeAvatarRequest,
    ShowCardRequest,
} from '../shared/models/api/api';
import { ClientUUID, GameInstanceUUID, PlayerUUID } from '../shared/models/system/uuid';

import { Config, getFrontEndEnvConfig } from '../shared/models/config/config';
import { AvatarKeys } from '../shared/models/ui/assets';
import { getEpochTimeMs } from '../shared/util/util';
import { Card } from '../shared/models/game/cards';

const clientUUIDCookieID = 'jp-client-uuid';
const ONE_DAY = 60 * 60 * 24;

const config: Config = getFrontEndEnvConfig();

export class WsServer {
    static clientUUID: ClientUUID | null;
    static ws: WebSocket;
    static subscriptions: { [key: string]: any } = {};
    static timeLastSentMsg: number;
    static gameInstanceUUID: GameInstanceUUID;

    static openWs(gameInstanceUUID: GameInstanceUUID) {
        console.log('opening ws...');
        this.clientUUID = docCookies.getItem(clientUUIDCookieID) as ClientUUID | null;
        this.gameInstanceUUID = gameInstanceUUID;

        const wsURL = `ws${config.SECURE_WS ? 's' : ''}://${config.SERVER_URL}:8081`;

        const wsURI = {
            url: wsURL,
            query: {
                clientUUID: this.clientUUID,
                gameInstanceUUID: gameInstanceUUID || null,
            } as ParsedQuery,
        };

        const openMessage = {
            open: true,
        };
        WsServer.ws = new WebSocket(queryString.stringifyUrl(wsURI), []);
        setTimeout(() => this.send(openMessage as any), 10);
        WsServer.ws.onmessage = WsServer.onGameMessage;
        WsServer.ws.onclose = WsServer.onWSClose;
        WsServer.timeLastSentMsg = getEpochTimeMs();
        return true;
    }

    private static onWSClose() {
        const key = 'onclose';
        WsServer.subscriptions[key].forEach((func) => func());
    }

    // TODO redesign dataCommunications and create general websocket data object so we
    // can add types here.
    private static onGameMessage(msg: MessageEvent) {
        const jsonData = JSON.parse(get(msg, 'data', {}));
        console.log('jsonData: ', jsonData);
        if (jsonData.clientUUID) {
            docCookies.setItem(clientUUIDCookieID, jsonData.clientUUID, ONE_DAY);
            WsServer.clientUUID = jsonData.clientUUID;
        }
        Object.keys(WsServer.subscriptions).forEach((key) => {
            if (jsonData[key]) {
                WsServer.subscriptions[key].forEach((func) => func(jsonData[key]));
            }
        });
    }

    // TODO make this private, and expose a helper method to each component.
    static send(message: ClientWsMessage) {
        const msgWithInfo: any = message;
        msgWithInfo.clientUUID = this.clientUUID;
        msgWithInfo.gameInstanceUUID = this.gameInstanceUUID;
        WsServer.timeLastSentMsg = getEpochTimeMs();
        WsServer.ws.send(JSON.stringify(msgWithInfo));
    }

    static ping() {
        if (!WsServer.ws) {
            return;
        }
        const pingMessage = {
            actionType: ClientActionType.PINGSTATE,
            request: {},
        } as ClientWsMessage;
        WsServer.send(pingMessage);
    }

    static sendKeepAliveMessage() {
        const clientWsMessage = {
            actionType: ClientActionType.KEEPALIVE,
            request: {},
        } as ClientWsMessage;
        WsServer.send(clientWsMessage);
    }

    static sendChatMessage(content: string) {
        const chatMessage: ClientChatMessage = { content };
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.CHAT,
            request: (chatMessage as ClientChatMessage) as ClientWsMessageRequest,
        };
        WsServer.send(clientWsMessage);
    }

    static sendBootPlayerMessage(playerUUID: PlayerUUID) {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.BOOTPLAYER,
            request: ({ playerUUID } as BootPlayerRequest) as ClientWsMessageRequest,
        };
        WsServer.send(clientWsMessage);
    }

    static sendAddAdminMessage(playerUUID: PlayerUUID) {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.ADDADMIN,
            request: ({ playerUUID } as AddAdminRequest) as ClientWsMessageRequest,
        };
        WsServer.send(clientWsMessage);
    }

    static sendRemoveAdminMessage(playerUUID: PlayerUUID) {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.REMOVEADMIN,
            request: ({ playerUUID } as RemoveAdminRequest) as ClientWsMessageRequest,
        };
        WsServer.send(clientWsMessage);
    }

    static sendJoinGameMessage(name: string, buyin: number, avatarKey: AvatarKeys) {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.JOINGAME,
            request: ({ name, buyin, avatarKey } as JoinGameRequest) as ClientWsMessageRequest,
        };
        this.send(clientWsMessage);
    }

    static sendJoinTableMessage(playerUUID: PlayerUUID, seatNumber: number) {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.JOINTABLE,
            request: ({ playerUUID, seatNumber } as JoinTableRequest) as ClientWsMessageRequest,
        };
        this.send(clientWsMessage);
    }

    static sendSeatChangeMessage(seatNumber: number) {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.SEATCHANGE,
            request: ({ seatNumber } as SeatChangeRequest) as ClientWsMessageRequest,
        };
        this.send(clientWsMessage);
    }

    static sendJoinGameAndJoinTableMessage(name: string, buyin: number, avatarKey: AvatarKeys) {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.JOINGAMEANDJOINTABLE,
            request: ({ name, buyin, avatarKey } as JoinGameRequest) as ClientWsMessageRequest,
        };
        this.send(clientWsMessage);
    }

    static sendSetChipsMessage(playerUUID: PlayerUUID, chipAmount: number) {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.SETCHIPS,
            request: ({ playerUUID, chipAmount } as SetChipsRequest) as ClientWsMessageRequest,
        };

        this.send(clientWsMessage);
    }

    static sendBuyChipsMessage(playerUUID: PlayerUUID, chipAmount: number) {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.BUYCHIPS,
            request: ({ playerUUID, chipAmount } as BuyChipsRequest) as ClientWsMessageRequest,
        };

        this.send(clientWsMessage);
    }

    static sendChangeAvatarMessage(playerUUID: PlayerUUID, avatarKey: AvatarKeys) {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.CHANGEAVATAR,
            request: ({ playerUUID, avatarKey } as ChangeAvatarRequest) as ClientWsMessageRequest,
        };

        this.send(clientWsMessage);
    }

    static sendShowCardMessage(cards: Card[]) {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.SHOWCARD,
            request: ({
                cards: cards,
            } as ShowCardRequest) as ClientWsMessageRequest,
        };
        this.send(clientWsMessage);
    }

    static sendHideCardMessage(cards: Card[]) {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.HIDECARD,
            request: ({
                cards: cards,
            } as ShowCardRequest) as ClientWsMessageRequest,
        };
        this.send(clientWsMessage);
    }

    static sendLeaveTableMessage() {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.LEAVETABLE,
            request: {} as ClientWsMessageRequest,
        };

        this.send(clientWsMessage);
    }

    static sendQuitGameMessage() {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.QUITGAME,
            request: {} as ClientWsMessageRequest,
        };

        this.send(clientWsMessage);
    }

    static subscribe(key: string, onMessage) {
        if (WsServer.subscriptions[key]) {
            WsServer.subscriptions[key].push(onMessage);
        } else {
            WsServer.subscriptions[key] = [onMessage];
        }
    }
}
