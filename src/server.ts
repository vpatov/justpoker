import "reflect-metadata";
import { Service, Container } from "typedi";

import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { AddressInfo } from "net";
import { Action, SitDownRequest } from './models/wsaction';
import { MessageService } from './service/messageService';

@Service()
class Server {

    app: express.Application;
    server: http.Server;
    defaultPort = 8080;
    wss: WebSocket.Server;

    constructor(private messageService: MessageService) {


    }

    init() {
        this.app = express();
        this.server = http.createServer(this.app);

        this.wss = new WebSocket.Server({ 'server': this.server });


        // TODO look at https://livebook.manning.com/book/typescript-quickly/chapter-10/v-9/233
        // where he has a baseclass for a MessageServer, that other MessageServers can extend
        // it could be a good idea to have a separate server for different types of actions

        this.wss.on('connection', (ws: WebSocket, req) => {
            const ip = req.connection.remoteAddress;
            console.log("connected to ip:", ip);



            ws.on('message', (data: WebSocket.Data) => {
                if (typeof data === 'string') {
                    try {
                        const action = JSON.parse(data);
                        const res = this.messageService.processMessage(action);
                        ws.send(res);
                    }
                    catch (e) {
                        console.log("Couldn't parse data.");
                        ws.send("Couldn't parse data.");
                    }

                } else {
                    console.log('Received data of unsupported type.');
                }
            });

            ws.send('You have connected to the websocket server.');

        });

        this.server.listen(process.env.PORT || this.defaultPort, () => {
            const port = this.server.address() as AddressInfo;
            console.log(`Server started on address ${JSON.stringify(port)} :)`);
        });

        this.app.get("/", (req, res) => {
            res.send("Poker Web.");
        });

        this.app.get("/newgame", (req, res) => {
            const name = req.query.name;


        });

    }
}

const server = Container.get(Server);
server.init();