import 'reflect-metadata';
import { Service, Container } from 'typedi';

import util from 'util';
import * as http from 'http';
import * as WebSocket from 'ws';
import express from 'express';
import bodyParser from 'body-parser';
import queryString from 'query-string';

import { AddressInfo } from 'net';
import { MessageService } from '../service/messageService';
import { GameStateManager } from '../service/gameStateManager';
import { StateConverter } from '../service/stateConverter';
import { generateUUID, logGameState, printObj, getLoggableGameState } from '../../../ui/src/shared/util/util';
import { AudioService } from '../service/audioService';
import { AnimationService } from '../service/animationService';
import { LedgerService } from '../service/ledgerService';
import { WSParams, EndPoint } from '../../../ui/src/shared/models/dataCommunication';

import { ChatService } from '../service/chatService';
import { StateGraphManager } from '../service/stateGraphManager';
import { NewGameForm } from '../../../ui/src/shared/models/table';
import { logger } from './logging';

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
    tableInitialized = false;
    performanceMetrics: PerformanceMetrics = {
        snippets: {
            MESSAGE_SERVICE_PROCESS_MESSAGE: [0, 0],
            SEND_UPDATES_WITH_TRANSFORM_FOR_ALL: [0, 0],
            TOTAL_WS_MESSAGE_PROCESS: [0, 0],
        },
    };

    constructor(
        private messageService: MessageService,
        private gsm: GameStateManager,
        private stateConverter: StateConverter,
        private stateGraphManager: StateGraphManager,
        private readonly chatService: ChatService,
        private readonly audioService: AudioService,
        private readonly animationService: AnimationService,
        private readonly ledgerService: LedgerService,
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

    private initRoutes(): void {
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
            const gameUUID = this.gsm.initGame(newGameForm);
            this.ledgerService.clearLedger();
            this.initWSSListeners();
            this.chatService.clearMessages();
            this.tableInitialized = true;
            logger.info(`GameUUID: ${gameUUID}`);
            res.send(JSON.stringify({ gameUUID: gameUUID }));
        });

        this.app.use(bodyParser.json());

        this.app.use(
            bodyParser.urlencoded({
                extended: true,
            }),
        );
        this.app.use('/', router);
    }

    sendGameUpdatesToClients() {
        for (const client of this.gsm.getConnectedClients()) {
            const ws = client.websockets.get(EndPoint.GAME);
            if (ws) {
                const res = this.stateConverter.getUIState(client.uuid);
                const jsonRes = JSON.stringify(res);
                ws.send(jsonRes);
            }
        }
    }

    sendLedgerUpdatesToClients() {
        for (const client of this.gsm.getConnectedClients()) {
            const ws = client.websockets.get(EndPoint.LEDGER);
            if (ws) {
                const res = { ledger: this.ledgerService.convertServerLedgerToUILedger() };
                const jsonRes = JSON.stringify(res);
                ws.send(jsonRes);
            }
        }
    }

    //refactor this mess of a function
    initWSSListeners() {
        this.wss.removeAllListeners();
        this.wss.on('connection', (ws: WebSocket, req) => {
            const ip = req.connection.remoteAddress;
            const parsedQuery = queryString.parseUrl(req.url);
            const queryParams: WSParams = {
                clientUUID: parsedQuery.query.clientUUID as string,
                gameUUID: parsedQuery.query.gameUUID as string,
                endpoint: parsedQuery.query.endpoint as EndPoint,
            };

            const clientUUID = queryParams.clientUUID || generateUUID();
            logger.info(
                `Connected to clientUUID: ${clientUUID}, gameUUID: ${queryParams.gameUUID}, endpoint: ${queryParams.endpoint}, IP Address: ${ip}`,
            );
            // TODO server shouldnt be communicating with the gameStateManager, but with some
            // other intermediary that will handle WS robustness
            this.gsm.initConnectedClient(clientUUID, ws, queryParams.endpoint);
            ws.send(JSON.stringify({ clientUUID: clientUUID }));

            switch (queryParams.endpoint) {
                case EndPoint.GAME: {
                    ws.send(JSON.stringify(this.stateConverter.getUIState(clientUUID)));
                    ws.on('message', (data: WebSocket.Data) => this.processGameMessage(ws, data, clientUUID));
                    logger.info(`Sent initial GAME message to client: ${clientUUID}`);
                    break;
                }

                case EndPoint.LEDGER: {
                    ws.send(JSON.stringify({ ledger: this.ledgerService.convertServerLedgerToUILedger() }));
                    logger.info(`Sent initial LEDGER message to client: ${clientUUID}`);
                    break;
                }

                default: {
                    logger.error(`Endpoint ${queryParams.endpoint} is not available.`);
                    throw Error(`Endpoint ${queryParams.endpoint} is not available.`);
                }
            }
        });
    }

    private processGameMessage(ws: WebSocket, data: WebSocket.Data, clientUUID: string) {
        logger.info(`Incoming Game Message: ${data}`);
        if (typeof data === 'string') {
            try {
                const receivedMessageTime = Date.now();
                const action = JSON.parse(data);
                this.messageService.processMessage(action, clientUUID);
                const msgServiceProcessMsgTime = Date.now() - receivedMessageTime;
                this.updateSnippet(ExecutionSnippet.PROCESS_MSG, msgServiceProcessMsgTime);
                this.logAverages();
            } catch (e) {
                logger.error(`EXCEPTION: ${e} GameState:  ${getLoggableGameState(this.gsm.getGameState())}`);

                // TODO should we throw an exception here?
                // throw e;
            }
        } else {
            logger.error('Received data of an unsupported type.');
        }
    }

    //refactor this mess of a function
    init() {
        this.app = express();
        this.initRoutes();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });

        this.stateGraphManager.observeStateGraphUpdates().subscribe(() => {
            this.sendGameUpdatesToClients();
            this.sendLedgerUpdatesToClients();
            this.audioService.reset();
            this.animationService.reset();
            this.chatService.clearLastMessage();
        });

        this.server.listen(process.env.PORT || this.defaultPort, () => {
            const port = this.server.address() as AddressInfo;
            logger.info(`Server started on address ${JSON.stringify(port)} :)`);
        });
    }
}

const server = Container.get(Server);
server.init();
