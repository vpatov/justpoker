"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const WebSocket = __importStar(require("ws"));
const app = express_1.default();
// simple http server
const server = http.createServer(app);
const defaultPort = 8080; // default port to listen
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws, req) => {
    const ip = req.connection.remoteAddress;
    console.log("connected to ip:", ip);
    ws.on('message', (data) => {
        try {
            const dataObj = JSON.parse(data);
            ws.send(`You sent: ${JSON.stringify(dataObj)}`);
        }
        catch (e) {
            ws.send('Couldn\'t parse data.');
        }
    });
    ws.send('You have connected to the websocket server.');
});
wss.on('connection', function connection(ws, req) {
    const ip = req.connection.remoteAddress;
});
server.listen(process.env.PORT || defaultPort, () => {
    const port = server.address();
    console.log(`Server started on address ${JSON.stringify(port)} :)`);
});
// define a route handler for the default home page
app.get("/", (req, res) => {
    res.send("Hello world!");
});
/*
// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );
*/
//# sourceMappingURL=server.js.map