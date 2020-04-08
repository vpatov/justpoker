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
import { MessageService } from '../../shared/service/messageService';
import { NewGameForm } from '../../shared/models/table';
import { GameStateManager } from '../../shared/service/gameStateManager';
import { generateUUID } from '../../shared/util/util';


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

        router.post('/createGame', (req, res) => {
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
            const tableId = this.gameStateManager.initGame(newGameForm);
            this.tableInitialized = true;
            console.log(tableId);
            res.send(JSON.stringify({ "tableId": tableId }));

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

        this.wss.on('connection', (ws: WebSocket, req) => {
            const ip = req.connection.remoteAddress;
            console.log("connected to ip:", ip);

            let clientId = '';
            try {
                clientId = cookie.parse(req.headers.cookie).id;
                // try to get clientId from cookie
                clientId = cookie.parse(req.headers.cookie).clientId;

                // try to get clientId from url
                if (!clientId){
                    const regEx = /clientId\=(\w+)/g;
                    clientId = Array.from(req.url.matchAll(regEx), m => m[1])[0];
                }
            }
            catch (e) {
                clientId = generateUUID()
            }
            console.log("clientId: ", clientId);

            this.gameStateManager.initConnectedClient(clientId);

            ws.send(JSON.stringify({
                status: 200,
                clientId: clientId,
            }));

            // Is it important for this message to come after the status200?
            // Is it guaranteed that it will arrive afterwards?
            ws.send(JSON.stringify(
                this.messageService.getGameStateMessageForUI()
            ));

            ws.on('message', (data: WebSocket.Data) => {
                console.log("Incoming:", data);
                if (typeof data === 'string') {
                    try {
                        const action = JSON.parse(data);
                        const res = this.messageService
                            .processMessage(action, clientId);
                        const jsonRes = JSON.stringify(res);
                        console.log(util.inspect(
                            res, false, null, true));

                        ws.send(jsonRes);
                    }
                    catch (e) {
                        console.log(e);

                        // TODO if you send errors this way, ensure that
                        // they dont contain sensitive information
                        ws.send(JSON.stringify(e));
                    }

                } else {
                    const unsupportedMsg = "Received data of unsupported type.";
                    console.log(unsupportedMsg);
                    ws.send(unsupportedMsg);
                }
            });

            // TODO replace all string responses with structured jsons
            ws.send(JSON.stringify(
                {"log":'You have connected to the websocket server.'}));

        });

        this.server.listen(process.env.PORT || this.defaultPort, () => {
            const port = this.server.address() as AddressInfo;
            console.log(
                `Server started on address ${JSON.stringify(port)} :)`);
        });


    }
}

const server = Container.get(Server);
server.init();