import get from 'lodash/get';
import docCookies from '../Cookies';
import queryString, { ParsedQuery } from 'query-string';
import {
    ClientWsMessage,
    ClientChatMessage,
    ClientActionType,
    ClientWsMessageRequest,
    BootPlayerRequest,
    WSParams,
} from '../shared/models/dataCommunication';

const clientUUID = 'clientUUID';
const ONE_DAY = 60 * 60 * 24;
const DEFAULT_WS_PORT = 8080;

export class WsServer {
    static clientUUID: string | null;
    static ws: WebSocket;
    static subscriptions: { [key: string]: any } = {};

    static openWs(gameInstanceUUID: string) {
        console.log('opening ws...');
        const wsURL = `ws://0.0.0.0:${DEFAULT_WS_PORT}`;
        const wsURI = {
            url: wsURL,
            query: {
                clientUUID: docCookies.getItem(clientUUID) || null,
                gameInstanceUUID: gameInstanceUUID || null,
            } as ParsedQuery,
        };

        WsServer.ws = new WebSocket(queryString.stringifyUrl(wsURI), []);
        WsServer.ws.onmessage = WsServer.onGameMessage;

        return true;
    }

    // TODO redesign dataCommunications and create general websocket data object so we
    // can add types here.
    private static onGameMessage(msg: MessageEvent) {
        const jsonData = JSON.parse(get(msg, 'data', {}));
        console.log(jsonData);
        if (jsonData.clientUUID) {
            docCookies.setItem(clientUUID, jsonData.clientUUID, ONE_DAY);
        }
        Object.keys(WsServer.subscriptions).forEach((key) => {
            if (jsonData[key]) {
                WsServer.subscriptions[key].forEach((func) => func(jsonData[key]));
            }
        });
    }

    // TODO make this private, and expose a helper method to each component.
    static send(message: ClientWsMessage) {
        console.log('sending: ', message);
        WsServer.ws.send(JSON.stringify(message));
    }

    static sendChatMessage(content: string) {
        const chatMessage: ClientChatMessage = { content };
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.CHAT,
            request: (chatMessage as ClientChatMessage) as ClientWsMessageRequest,
        };
        WsServer.ws.send(JSON.stringify(clientWsMessage));
    }

    static sendBootPlayerMessage(playerUUID: string) {
        const clientWsMessage: ClientWsMessage = {
            actionType: ClientActionType.BOOTPLAYER,
            request: ({ playerUUID } as BootPlayerRequest) as ClientWsMessageRequest,
        };
        WsServer.ws.send(JSON.stringify(clientWsMessage));
    }

    static subscribe(key: string, onMessage) {
        console.log(key, onMessage);
        if (WsServer.subscriptions[key]) {
            WsServer.subscriptions[key].push(onMessage);
        } else {
            WsServer.subscriptions[key] = [onMessage];
        }
    }
}
