import "reflect-metadata";
import { Service, Container } from "typedi";

import util from 'util';
import * as http from 'http';
import * as WebSocket from 'ws';
import express from 'express'
import bodyParser from "body-parser"
import request from 'request'
import cookie from 'cookie';

import { AddressInfo } from "net";
import { MessageService } from './service/messageService';
import { NewGameForm } from './models/table';
import { GameStateManager } from './service/gameStateManager';
import { generateUUID } from './util/util';


@Service()
class Server {

    app: express.Application;
    server: http.Server;
    defaultPort = 8080;
    wss: WebSocket.Server;
    tableInitialized = false;

    constructor(
        private messageService: MessageService,
        private gameStateManager: GameStateManager, ) { }

    private initRoutes(): void {
        const router = express.Router()

        router.get('/', (req, res) => {
            res.send("Poker Web.");
        })

        router.post('/create', (req, res) => {
            // if (this.tableInitialized && false) {
            //     res.send("Table already initialized. Can only make one " +
            //         "table per server instance (restriction is temporary," +
            //         " put in place just for MVP/dev)");
            // }
            const newGameForm = {
                smallBlind: req.body.smallBlind,
                bigBlind: req.body.bigBlind,
                gameType: req.body.gameType,
                password: req.body.password
            };
            const tableUUID = this.gameStateManager.initGame(newGameForm);
            this.tableInitialized = true;
            console.log(tableUUID);
            res.send(JSON.stringify({ "tableUUID": tableUUID }));

        });

        this.app.use(bodyParser.json());

        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        this.app.use('/', router);
    }

    init() {
        this.app = express();
        this.initRoutes();
        this.server = http.createServer(this.app);

        this.wss = new WebSocket.Server({ 'server': this.server });


        /* TODO look at
        https://livebook.manning.com/book/typescript-quickly/chapter-10/v-9/233
        where he has a baseclass for a MessageServer, that other MessageServers
        can extend. it could be a good idea to have a separate server for
        different types of actions
        */

        this.wss.on('connection', (ws: WebSocket, req) => {
            const ip = req.connection.remoteAddress;
            console.log("connected to ip:", ip);
            let userCookieID = '';

            console.log(req.headers);

            try {
                userCookieID = cookie.parse(req.headers.cookie).id;
            }
            catch (e) {
                console.log(e);
                return;
            }
            console.log(userCookieID);
            this.gameStateManager.initConnectedClient(userCookieID);

            ws.on('message', (data: WebSocket.Data) => {
                console.log("Incoming:", data);
                if (typeof data === 'string') {
                    // TODO populate error meaningfully
                    const error = '';
                    try {
                        const action = JSON.parse(data);
                        const res = this.messageService
                            .processMessage(action, userCookieID);
                        const jsonRes = JSON.stringify(res);
                        console.log(util.inspect(
                            res, false, null, true));

                        ws.send(jsonRes);
                    }
                    catch (e) {
                        console.log(e);
                        ws.send(error);
                    }

                } else {
                    console.log('Received data of unsupported type.');
                }
            });

            ws.send('You have connected to the websocket server.');

        });

        this.server.listen(process.env.PORT || this.defaultPort, () => {
            const port = this.server.address() as AddressInfo;
            console.log(
                `Server started on address ${JSON.stringify(port)} :)`);
        });


    }
}

//   this.mountRoutes()
// }



const server = Container.get(Server);
server.init();