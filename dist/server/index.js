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
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });
    ws.send('You have connected to the websocket server.');
});
server.listen(process.env.PORT || defaultPort, () => {
    console.log(`Server started on address ${server.address()} :)`);
    console.log('Server:', server);
});
/*
// define a route handler for the default home page
app.get( "/", (req, res) => {
    res.send( "Hello world!" );
} );

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );
*/
//# sourceMappingURL=index.js.map