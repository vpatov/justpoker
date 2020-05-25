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

import {
    NewGameForm,
    ClientAction,
    Event,
    EndPoint,
    EventType,
    ClientWsMessage,
} from '../../../ui/src/shared/models/dataCommunication';

import { logger, debugFunc } from '../logger';
import { ConnectedClientManager } from './connectedClientManager';
import { getDefaultGame404 } from '../../../ui/src/shared/models/uiState';

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
            res.send(JSON.stringify({ gameInstanceUUID: gameInstanceUUID }));
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
    private processGameMessage(data: WebSocket.Data, clientUUID: string, gameInstanceUUID: string) {
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
            logger.verbose(`WS connection request from: ${ip}`);

            const parsedQuery = queryString.parseUrl(req.url);
            const clientUUID = parsedQuery.query.clientUUID as string;
            const gameInstanceUUID = parsedQuery.query.gameInstanceUUID as string;
            const endpoint = parsedQuery.query.endpoint as string;

            // TODO, I don't think we should pass the endpoint in the body, rather match across the actual url
            switch (endpoint) {
                case EndPoint.GAME: {
                    this.onConnectionToGame(ws, gameInstanceUUID, clientUUID);
                    return;
                }
                default: {
                    const errorMessage = `No websocket interaction at url: ${req.url}`;
                    logger.error(errorMessage);
                    ws.close(404, errorMessage);
                }
            }
        });
    }

    onConnectionToGame(ws: WebSocket, gameInstanceUUID: string, clientUUID: string) {
        // if game is not in instanceManager then send 404
        // TODO implement FE for this
        if (!this.gameInstanceManager.doesGameExist(gameInstanceUUID)) {
            ws.send(JSON.stringify(getDefaultGame404()));
            return;
        }
        // if a uuid was not sent by client (that is there is no session) then create one
        if (!clientUUID) {
            clientUUID = this.connectedClientManager.createClientSessionInGroup(gameInstanceUUID, ws);
        } else {
            // if there is a session replace old websocket
            // TODO define app behavior in scenario when user accesses same game in two browser tabs.
            this.connectedClientManager.updateClientSessionInGroup(gameInstanceUUID, clientUUID, ws);
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
    }

    //refactor this mess of a function
    init() {
        this.app = express();
        this.initHTTPRoutes();
        this.server = http.createServer(this.app);
        this.initGameWSS();
        this.server.listen(process.env.PORT || this.defaultPort, () => {
            const port = this.server.address() as AddressInfo;
            logger.info(`Server started on address `, port);
        });
    }
}

const server = Container.get(Server);
server.init();
