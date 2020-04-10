import get from "lodash/get";
import docCookies from "../Cookies";

export const server = {};
const wsSubscriptions = {};

export function OpenWs() {
  let wsURI = "ws://localhost:8080";

  const clientID = docCookies.getItem("clientID");
  if (clientID) {
    wsURI += `?clientID=${clientID}`;
  }

  // open websocket
  server.ws = new WebSocket(wsURI, []);

  server.ws.onmessage = (msg) => {
    console.log("Incoming message from sever:\n", msg);

    const jsonData = JSON.parse(get(msg, "data", {}));


    if (jsonData.clientID) {
      docCookies.setItem("clientID", jsonData.clientID);
    }

    Object.keys(wsSubscriptions).forEach((key) => {
      if (jsonData[key]) {
        wsSubscriptions[key].forEach((func) => func(jsonData[key]));
      }
    });
  };



  return true;
}

server.send = function(data) {
  server.ws.send(JSON.stringify(data));
}

export function Subscribe(key, onMessage) {
  if (wsSubscriptions[key]) {
    wsSubscriptions[key].push(onMessage);
  } else {
    wsSubscriptions[key] = [onMessage];
  }
}
