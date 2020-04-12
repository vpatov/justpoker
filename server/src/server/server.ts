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
import { ActionType } from '../../../shared/models/wsaction';
import { MessageService } from '../service/messageService';
import { NewGameForm } from '../../../shared/models/table';
import { GameState } from '../../../shared/models/gameState';
import { GameStateManager } from '../service/gameStateManager';
import { StateTransformService } from '../service/stateTransformService';
import { DeckService } from '../service/deckService';
import { generateUUID, printObj } from '../../../shared/util/util';

function logGameState(gameState: GameState) {
    console.log('\n\nServer game state:\n');
    const minimizedGameState = {
        ...gameState,
        table: {
            uuid: gameState.table.uuid,
            activeConnections: [
                ...Object.entries(gameState.table.activeConnections).map(([uuid, client]) => [
                    {
                        ...client,
                        ws: 'ommittedWebSocket',
                    },
                ]),
            ],
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
        private gameStateManager: GameStateManager,
        private stateTransformService: StateTransformService,
        private deckService: DeckService,
    ) {}

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

    sendUpdatesToClients() {
        for (const client of this.gameStateManager.getConnectedClients()) {
            const res = this.stateTransformService.getUIState(client.uuid);
            const jsonRes = JSON.stringify(res);
            client.ws.send(jsonRes);

            /* Debug Logging */
            const playerName = client.playerUUID
                ? this.gameStateManager.getPlayer(client.playerUUID).name
                : 'Anonymous Client';
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

        this.gameStateManager.observeUpdates().subscribe(() => {
            console.log('from observeUpdates');
            this.sendUpdatesToClients();
        });

        this.wss.on('connection', (ws: WebSocket, req) => {
            const ip = req.connection.remoteAddress;
            console.log('connected to ip:', ip);

            let clientID = '';
            try {
                // try to get clientID from cookie (local script testing)
                clientID = cookie.parse(req.headers.cookie).clientID;
                // try to get clientID from url (frontend)
                if (!clientID) {
                    const regEx = /clientID\=(\w+)/g;
                    clientID = Array.from(req.url.matchAll(regEx), (m) => m[1])[0];
                }
                if (!clientID) {
                    clientID = generateUUID();
                }
            } catch (e) {
                clientID = generateUUID();
            }
            console.log('clientID: ', clientID);

            this.gameStateManager.initConnectedClient(clientID, ws);

            ws.send(
                JSON.stringify({
                    status: 200,
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

                        this.sendUpdatesToClients();

                        /* Debug Logging */
                        logGameState(this.gameStateManager.getGameState());
                        /* -------------- */
                    } catch (e) {
                        /* Debug Logging */
                        console.log(e);
                        logGameState(this.gameStateManager.getGameState());
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
