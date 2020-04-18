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
import { MessageService } from '../service/messageService';
import { GameState } from '../../../ui/src/shared/models/gameState';
import { GameStateManager } from '../service/gameStateManager';
import { StateTransformService } from '../service/stateTransformService';
import { generateUUID, printObj } from '../../../ui/src/shared/util/util';
import { TimerManager } from '../service/timerManager';

function logGameState(gameState: GameState) {
    console.log('\n\nServer game state:\n');
    const minimizedGameState = {
        ...gameState,
        table: {
            uuid: gameState.table.uuid,
            activeConnections: [...gameState.table.activeConnections.entries()].map(([uuid, client]) => [
                {
                    ...client,
                    ws: 'ommittedWebSocket',
                },
            ]),
        },
        // gameParameters: undefined as string,
        // board: undefined as string,

        deck: [] as any,
    };
    console.log(util.inspect(minimizedGameState, false, null, true));
}

@Service()
class Server {
    app: express.Application;
    server: http.Server;
    defaultPort = 8080;
    wss: WebSocket.Server;
    tableInitialized = false;

    constructor(
        private messageService: MessageService,
        private gsm: GameStateManager,
        private stateTransformService: StateTransformService,
        private timerManager: TimerManager,
    ) {}

    private initRoutes(): void {
        const router = express.Router();

        router.get('/', (req, res) => {
            res.send('Poker Web.');
        });

        router.post('/createGame', (req, res) => {
            const newGameForm = {
                smallBlind: req.body.smallBlind,
                bigBlind: req.body.bigBlind,
                gameType: req.body.gameType,
                password: req.body.password,
            };
            const tableId = this.gsm.initGame(newGameForm);
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

    sendUpdatesToClients(gameState: GameState) {
        if (!gameState.isStateReady) {
            return;
        }
        for (const client of this.gsm.getConnectedClients()) {
            const res = this.stateTransformService.getUIState(client.uuid);
            const jsonRes = JSON.stringify(res);
            client.ws.send(jsonRes);

            // continue;
            /* Debug Logging */
            const playerName = client.playerUUID ? this.gsm.getPlayer(client.playerUUID).name : 'Anonymous Client';
            console.log(`\n\nServer is sending following ui state to ${playerName} ${client.uuid}:\n'`);
            console.log(util.inspect(res, false, null, true));
            /* -------------- */
        }
    }

    //refactor this mess of a function
    init() {
        this.app = express();
        this.initRoutes();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });

        this.timerManager.observeUpdates().subscribe((gameState) => {
            debugger;
            this.sendUpdatesToClients(gameState);
            /* Debug Logging */
            logGameState(gameState);
            // logGameState(this.gameStateManager.getGameState());
            /* -------------- */
        });

        this.wss.on('connection', (ws: WebSocket, req) => {
            const ip = req.connection.remoteAddress;
            console.log('connected to ip:', ip);

            let clientID = '';
            // try to get clientID from cookie (local script testing)
            // try {
            //     clientID = cookie.parse(req.headers.cookie).clientID;
            // } catch (e) {
            //     console.log(e, 'generating new uuid');
            // }

            // try to get clientID from url (frontend)
            if (!clientID) {
                const regEx = /clientID\=(\w+)/g;
                clientID = Array.from(req.url.matchAll(regEx), (m) => m[1])[0];
            }
            if (!clientID) {
                clientID = generateUUID();
            }

            console.log('clientID: ', clientID);

            // TODO server shouldnt be communicating with the gameStateManager, but with some
            // other intermediary that will handle WS robustness
            this.gsm.initConnectedClient(clientID, ws);

            ws.send(
                JSON.stringify({
                    clientID,
                }),
            );

            ws.send(JSON.stringify(this.stateTransformService.getUIState(clientID)));

            ws.on('message', (data: WebSocket.Data) => {
                console.log('Incoming data:', util.inspect(data, false, null, true));
                if (typeof data === 'string') {
                    try {
                        const action = JSON.parse(data);
                        this.messageService.processMessage(action, clientID);

                        this.sendUpdatesToClients(this.gsm.getGameState());

                        /* Debug Logging */
                        logGameState(this.gsm.getGameState());
                        /* -------------- */
                    } catch (e) {
                        /* Debug Logging */
                        console.log(e);
                        logGameState(this.gsm.getGameState());
                        /* -------------- */
                    }
                } else {
                    const unsupportedMsg = 'Received data of unsupported type.';
                    console.log(unsupportedMsg);
                    ws.send(JSON.stringify({ error: unsupportedMsg }));
                }
            });
        });

        this.server.listen(process.env.PORT || this.defaultPort, () => {
            const port = this.server.address() as AddressInfo;
            console.log(`Server started on address ${JSON.stringify(port)} :)`);
        });
    }
}

const server = Container.get(Server);
server.init();
