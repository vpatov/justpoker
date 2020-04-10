import 'reflect-metadata';
import { Service, Container } from 'typedi';

import util from 'util';
import * as http from 'http';
import * as WebSocket from 'ws';
import express from 'express';
import bodyParser from 'body-parser';
import request from 'request';
import cookie from 'cookie';

import { AddressInfo } from 'net';
import { ActionType } from '../../shared/models/wsaction';
import { MessageService } from '../../shared/service/messageService';
import { NewGameForm } from '../../shared/models/table';
import { GameStateManager } from '../../shared/service/gameStateManager';
import { generateUUID, printObj } from '../../shared/util/util';

@Service()
class Server {
    app: express.Application;
    server: http.Server;
    defaultPort = 8080;
    wss: WebSocket.Server;
    tableInitialized = false;

    constructor(private messageService: MessageService, private gameStateManager: GameStateManager) {}

    private initRoutes(): void {
        const router = express.Router();

        router.get('/', (req, res) => {
            res.send('Poker Web.');
        });

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
                password: req.body.password,
            };
            const tableId = this.gameStateManager.initGame(newGameForm);
            this.tableInitialized = true;
            console.log(tableId);
            res.send(JSON.stringify({ tableId: tableId }));
        });

        this.app.use(bodyParser.json());

        this.app.use(
            bodyParser.urlencoded({
                extended: true,
            }),
        );
        this.app.use('/', router);
    }

    init() {
        this.app = express();
        this.initRoutes();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });

        this.wss.on('connection', (ws: WebSocket, req) => {
            const ip = req.connection.remoteAddress;
            console.log('connected to ip:', ip);

            // try to get clientID from cookie (local script testing)
            let clientID = cookie.parse(req.headers.cookie).clientID;

            // try to get clientID from url (frontend)
            if (!clientID) {
                const regEx = /clientID\=(\w+)/g;
                clientID = Array.from(req.url.matchAll(regEx), (m) => m[1])[0];
            }

            if (!clientID) {
                clientID = generateUUID();
            }

            console.log('clientID: ', clientID);

            this.gameStateManager.initConnectedClient(clientID);

            ws.send(
                JSON.stringify({
                    status: 200,
                    clientID,
                }),
            );

            ws.send(
                JSON.stringify(
                    this.messageService.processMessage({ actionType: ActionType.PINGSTATE, data: {} }, clientID),
                ),
            );

            ws.on('message', (data: WebSocket.Data) => {
                console.log('Incoming data:', util.inspect(data, false, null, true));

                if (typeof data === 'string') {
                    try {
                        const action = JSON.parse(data);
                        const res = this.messageService.processMessage(action, clientID);

                        console.log('\n\nServer is sending to UI:\n');
                        console.log(util.inspect(res, false, null, true));

                        console.log('\n\nServer game state:\n');
                        console.log(util.inspect(this.gameStateManager.getGameState(), false, null, true));

                        const jsonRes = JSON.stringify(res);
                        ws.send(jsonRes);
                    } catch (e) {
                        console.log(e);

                        // TODO if you send errors this way, ensure that
                        // they dont contain sensitive information
                        ws.send(JSON.stringify(e));
                    }
                } else {
                    const unsupportedMsg = 'Received data of unsupported type.';
                    console.log(unsupportedMsg);
                    ws.send(JSON.stringify({ error: unsupportedMsg }));
                }
            });

            // TODO replace all string responses with structured jsons
            ws.send(JSON.stringify({ log: 'You have connected to the websocket server.' }));
        });

        this.server.listen(process.env.PORT || this.defaultPort, () => {
            const port = this.server.address() as AddressInfo;
            console.log(`Server started on address ${JSON.stringify(port)} :)`);
        });
    }
}

const server = Container.get(Server);
server.init();
