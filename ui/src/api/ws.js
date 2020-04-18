import get from "lodash/get";
import docCookies from "../Cookies";

export const server = {};
const wsSubscriptions = {};

export function OpenWs() {
    let wsURI =
        process.env.NODE_ENV === "jp-dev"
            ? "ws://35.192.65.13:8080"
            : "ws://localhost:8080";

    const clientID = docCookies.getItem("clientID");
    if (clientID) {
        wsURI += `?clientID=${clientID}`;
    }

    // open websocket
    server.ws = new WebSocket(wsURI, []);

    server.ws.onmessage = (msg) => {
        const jsonData = JSON.parse(get(msg, "data", {}));

        console.log("Data from sever:\n", jsonData);

        if (jsonData.clientID) {
            docCookies.setItem("clientID", jsonData.clientID, 60 * 60 * 24); // one day expire
        }

        Object.keys(wsSubscriptions).forEach((key) => {
            if (jsonData[key]) {
                wsSubscriptions[key].forEach((func) => func(jsonData[key]));
            }
        });
    };

    return true;
}

server.send = function (data) {
    server.ws.send(JSON.stringify(data));
};

// TODO create stricter api for sending messages to server. DOM node source shouldnt be responsible
// for correctly constructing messages.

export function Subscribe(key, onMessage) {
    console.log(key, onMessage);

    if (wsSubscriptions[key]) {
        wsSubscriptions[key].push(onMessage);
    } else {
        wsSubscriptions[key] = [onMessage];
    }
}
