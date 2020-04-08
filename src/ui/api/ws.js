import get from "lodash/get";
import docCookies from "../Cookies";

export const server = {};
const wsSubscriptions = {};

export function OpenWs() {
  let wsURI = "ws://localhost:8080";

  const clientId = docCookies.getItem("clientId");
  if (clientId) {
    wsURI += `?clientId=${clientId}`;
  }

  // open websocket
  server.ws = new WebSocket(wsURI, []);

  server.ws.onmessage = (msg) => {
    console.log(msg);
    
    const jsonData = JSON.parse(get(msg, "data", {}));

    console.log(jsonData);

    if (jsonData.clientId) {
      docCookies.setItem("clientId", jsonData.clientId);
    }

    Object.keys(wsSubscriptions).forEach((key) => {
      if (jsonData[key]) {
        wsSubscriptions[key].forEach((func) => func(jsonData[key]));
      }
    });
  };

  return true;
}

export function Subscribe(key, onMessage) {
  if (wsSubscriptions[key]) {
    wsSubscriptions[key].push(onMessage);
  } else {
    wsSubscriptions[key] = [onMessage];
  }
}
