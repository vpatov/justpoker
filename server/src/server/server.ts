import 'reflect-metadata';
import { Service, Container } from 'typedi';

import * as http from 'http';
import * as WebSocket from 'ws';
import express from 'express';
import bodyParser from 'body-parser';
import queryString from 'query-string';

import { AddressInfo } from 'net';
import { EventProcessorService } from '../service/eventProcessorService';
import { StateConverter } from '../service/stateConverter';
import { GameInstanceManager } from '../service/gameInstanceManager';

import { NewGameForm, ClientAction, Event, EventType, ClientWsMessage } from '../../../ui/src/shared/models/api';

import { logger, debugFunc } from '../logger';
import { ConnectedClientManager } from './connectedClientManager';
import { getDefaultGame404 } from '../../../ui/src/shared/models/uiState';
import { GameInstanceUUID, ClientUUID, generateClientUUID } from '../../../ui/src/shared/models/uuid';

declare interface PerformanceMetrics {
    // sum, count (used for average)
    snippets: { [key in ExecutionSnippet]: [number, number] };
}

const enum ExecutionSnippet {
    PROCESS_MSG = 'MESSAGE_SERVICE_PROCESS_MESSAGE',
    SEND_UPDATES = 'SEND_UPDATES_WITH_TRANSFORM_FOR_ALL',
    TOTAL_WS_MESSAGE_PROCESS = 'TOTAL_WS_MESSAGE_PROCESS',
}

@Service()
class Server {
    app: express.Application;
    server: http.Server;
    defaultPort = 8080;
    wss: WebSocket.Server;
    performanceMetrics: PerformanceMetrics = {
        snippets: {
            MESSAGE_SERVICE_PROCESS_MESSAGE: [0, 0],
            SEND_UPDATES_WITH_TRANSFORM_FOR_ALL: [0, 0],
            TOTAL_WS_MESSAGE_PROCESS: [0, 0],
        },
    };

    constructor(
        private eventProcessorService: EventProcessorService,
        private stateConverter: StateConverter,
        private readonly gameInstanceManager: GameInstanceManager,
        private readonly connectedClientManager: ConnectedClientManager,
    ) {}

    updateSnippet(snippet: ExecutionSnippet, ms: number) {
        this.performanceMetrics.snippets[snippet][0] += ms;
        this.performanceMetrics.snippets[snippet][1] += 1;
    }

    logAverages() {
        Object.entries(this.performanceMetrics.snippets).forEach(([snippet, [sum, count]]) => {
            if (count === 0) {
                return;
            }
            // dont flood the console
            if (count % 10 === 0) {
                logger.debug(`${snippet}: Average over ${count} samples: ${sum / count}`);
            }
        });
    }

    private initHTTPRoutes(): void {
        const router = express.Router();

        router.get('/', (req, res) => {
            res.send('Poker Web.');
        });

        router.post('/createGame', (req, res) => {
            const newGameForm: NewGameForm = {
                smallBlind: req.body.smallBlind,
                bigBlind: req.body.bigBlind,
                gameType: req.body.gameType,
                maxBuyin: req.body.maxBuyin,
                password: req.body.password,
                timeToAct: req.body.timeToAct,
            };
            const gameInstanceUUID = this.gameInstanceManager.createNewGameInstance(newGameForm);
            this.connectedClientManager.createNewClientGroup(gameInstanceUUID);

            logger.info(`Creating new game with gameInstanceUUID: ${gameInstanceUUID}`);
            res.send({ gameInstanceUUID: gameInstanceUUID });
        });

        router.get('/ledger', (req, res) => {
            const parsedQuery = queryString.parseUrl(req.url);
            const gameInstanceUUID = parsedQuery.query.gameInstanceUUID as GameInstanceUUID;
            const ledger = this.gameInstanceManager.getLedgerForGameInstance(gameInstanceUUID);
            if (!ledger) {
                logger.info(`ledger not found for ${gameInstanceUUID}`);
                res.send(getDefaultGame404());
            } else {
                res.send({ ledger: ledger });
            }
        });

        this.app.use(bodyParser.json());
        this.app.use(
            bodyParser.urlencoded({
                extended: true,
            }),
        );
        this.app.use('/', router);
    }

    @debugFunc()
    sendGameUpdatesToClients() {
        const activeGameInstanceUUID = this.gameInstanceManager.getActiveGameInstanceUUID();
        this.connectedClientManager.sendStateToEachInGroup(activeGameInstanceUUID);
    }

    @debugFunc()
    private processGameMessage(data: WebSocket.Data, clientUUID: ClientUUID, gameInstanceUUID: GameInstanceUUID) {
        logger.verbose(`Incoming Game Message: ${data}`);

        // TODO typeof check seems not the best way to do this
        if (typeof data === 'string') {
            try {
                const wsMessage: ClientWsMessage = JSON.parse(data);
                const event: Event = {
                    eventType: EventType.CLIENT_ACTION,
                    body: {
                        gameInstanceUUID,
                        clientUUID,
                        actionType: wsMessage.actionType,
                        request: wsMessage.request,
                    } as ClientAction,
                };

                this.eventProcessorService.processEvent(event);
            } catch (e) {
                logger.error(e);
            }
        } else {
            logger.error('Received data of an unsupported type.');
        }
    }

    initGameWSS() {
        this.wss = new WebSocket.Server({ server: this.server });
        this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
            const ip = req.connection.remoteAddress;
            logger.verbose(`WS connection request from: ${ip} on url: ${req.url}`);

            const parsedQuery = queryString.parseUrl(req.url);
            const clientUUID = parsedQuery.query.clientUUID as ClientUUID;
            const gameInstanceUUID = parsedQuery.query.gameInstanceUUID as GameInstanceUUID;

            this.onConnectionToGame(ws, gameInstanceUUID, clientUUID);
            return;
        });
    }

    onConnectionToGame(ws: WebSocket, gameInstanceUUID: GameInstanceUUID, clientUUID: ClientUUID) {
        // if game is not in instanceManager then send 404
        if (!this.gameInstanceManager.doesGameInstanceExist(gameInstanceUUID)) {
            ws.send(JSON.stringify(getDefaultGame404()));
            return;
        }
        // if a uuid was not sent by client (that is there is no session) then create one
        let currentClientUUID = clientUUID;
        if (!currentClientUUID) {
            currentClientUUID = generateClientUUID();
            // send back clientUUID for client to store
            ws.send(JSON.stringify({ clientUUID }));
        }
        // this will either add client to group if not in group
        // or if in group will replace old websocket with new websocket
        const succ = this.connectedClientManager.addOrUpdateClientInGroup(gameInstanceUUID, currentClientUUID, ws);
        if (!succ) {
            logger.error(
                `Group ${gameInstanceUUID} does not exist. Group should have be init on create game. Client ${currentClientUUID} not added.`,
            );
        }

        logger.verbose(`Connected to clientUUID: ${clientUUID}, gameInstanceUUID: ${gameInstanceUUID}`);

        // add client to game instance
        this.gameInstanceManager.loadGameInstance(gameInstanceUUID);
        this.gameInstanceManager.addClientToGameInstance(gameInstanceUUID, clientUUID);

        // send init state to newly connected client
        // TODO can remove server's dependency on stateConverter by processing an event here,
        // the event being a server action like GAME_INIT or something.
        ws.send(JSON.stringify(this.stateConverter.getUIState(clientUUID, true)));

        // maybe this should be done else where?
        ws.on('message', (data: WebSocket.Data) => this.processGameMessage(data, clientUUID, gameInstanceUUID));
        ws.on('close', (data: WebSocket.Data) => {
            logger.warn('WS CLOSE!');
        });
    }

    //refactor this mess of a function
    init() {
        this.app = express();
        this.initHTTPRoutes();
        this.server = http.createServer(this.app);
        this.initGameWSS();
        this.server.listen(process.env.PORT || this.defaultPort, () => {
            const addressInfo = this.server.address() as AddressInfo;
            logger.info(`Server started on address `, addressInfo);
        });
    }
}

const server = Container.get(Server);
server.init();
