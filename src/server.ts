import "reflect-metadata";
// TODO before continuing to try to incorporate DI here
// read up more about Nest.js and see if it is a good fit for you - nestjs handles DI


import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { AddressInfo } from "net";
import { Action, SitDownRequest } from './models/wsaction';

const app = express();

// simple http server
const server = http.createServer(app);

const defaultPort = 8080; // default port to listen

const wss = new WebSocket.Server({ server });


// TODO look at https://livebook.manning.com/book/typescript-quickly/chapter-10/v-9/233
// where he has a baseclass for a MessageServer, that other MessageServers can extend
// it could be a good idea to have a separate server for different types of actions

wss.on('connection', (ws: WebSocket, req) => {
    const ip = req.connection.remoteAddress;
    console.log("connected to ip:", ip);

    ws.on('message', (data: WebSocket.Data) => {
        if (typeof data === 'string') {
            const action = JSON.parse(data);
            const sitDownRequest = action.data as SitDownRequest;


            ws.send(`action: ${JSON.stringify(action)}, sitDownRequest: ${JSON.stringify(sitDownRequest)}`);
        } else {
            console.log('Received data of unsupported type.');
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
