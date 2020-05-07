import get from "lodash/get";
import docCookies from "../Cookies";
import {
    ClientWsMessage,
    ClientChatMessage,
    ActionType,
    ClientWsMessageRequest,
    BootPlayerRequest,
} from "../shared/models/wsaction";

// TODO create stricter api for sending messages to server. DOM node source shouldnt be responsible
// for correctly constructing messages.

export class WsServer {
    static clientID: string|null;
    static ws: WebSocket;
    static subscriptions: { [key: string]: any } = {};

    static openWs() {
        console.log("opening ws...");
        let wsURI =
            process.env.NODE_ENV === "production"
                ? "ws://35.192.65.13:8080"
                : "ws://localhost:8080";

        WsServer.clientID = docCookies.getItem("clientID");
        if (WsServer.clientID) {
            wsURI += `?clientID=${WsServer.clientID}`;
        }

        WsServer.ws = new WebSocket(wsURI, []);
        WsServer.ws.onmessage = WsServer.onMessage;
        return true;
    }

    private static onMessage(msg: MessageEvent) {
        const jsonData = JSON.parse(get(msg, "data", {}));
        console.log("Data from sever:\n", jsonData);
        if (jsonData.clientID) {
            docCookies.setItem("clientID", jsonData.clientID, 60 * 60 * 24); // one day expire
        }
        Object.keys(WsServer.subscriptions).forEach((key) => {
            if (jsonData[key]) {
                WsServer.subscriptions[key].forEach((func) =>
                    func(jsonData[key])
                );
            }
        });
    }

    static send(message: ClientWsMessage) {
        WsServer.ws.send(JSON.stringify(message));
    }

    static sendChatMessage(content: string) {
        const chatMessage: ClientChatMessage = { content };
        const clientWsMessage: ClientWsMessage = {
            actionType: ActionType.CHAT,
            request: chatMessage as ClientChatMessage as ClientWsMessageRequest,
        };
        WsServer.ws.send(JSON.stringify(clientWsMessage));
    }

    static sendBootPlayerMessage(playerUUID: string){
        const clientWsMessage: ClientWsMessage = {
            actionType: ActionType.BOOTPLAYER,
            request: {playerUUID} as BootPlayerRequest as ClientWsMessageRequest
        }
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

    // TODO
    static reopenWebsocket() {}

    static lintTest() {
        
    }
}
