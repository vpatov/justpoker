import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { AddressInfo } from "net";

const app = express();

// simple http server
const server = http.createServer(app);

const defaultPort = 8080; // default port to listen

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket, req) => {
    const ip = req.connection.remoteAddress;
    console.log("connected to ip:", ip);

    ws.on('message', (data: string) => {
        try {
            const dataObj: any = JSON.parse(data);
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
    const port = server.address() as AddressInfo;
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
