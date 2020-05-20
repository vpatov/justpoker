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
import { GameInstanceManager } from '../service/gameInstanceManager';

import { WSParams, EndPoint } from '../../../ui/src/shared/models/dataCommunication';

import { ChatService } from '../service/chatService';
import { StateGraphManager } from '../service/stateGraphManager';
import { NewGameForm } from '../../../ui/src/shared/models/table';
import { logger } from './logging';
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
        private messageService: MessageService,
        private gsm: GameStateManager,
        private stateConverter: StateConverter,
        private stateGraphManager: StateGraphManager,
        private readonly chatService: ChatService,
        private readonly audioService: AudioService,
        private readonly animationService: AnimationService,
        private readonly ledgerService: LedgerService,
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
            const gameUUID = this.gameInstanceManager.createNewGameInstance(newGameForm);
            this.connectedClientManager.createNewClientGroup(gameUUID);
            this.ledgerService.clearLedger();
            logger.info(`gameUUID: ${gameUUID}`);
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
        const activeGameInstanceUUID = this.gameInstanceManager.getActiveGameInstanceUUID();
        this.connectedClientManager.sendStateToEachInGroup(activeGameInstanceUUID);
    }

    // we need to rethink this i think,  see comment on PR

    // sendLedgerUpdatesToClients() {
    //     for (const client of this.gsm.getConnectedClients()) {
    //         const ws = client.websockets.get(EndPoint.LEDGER);
    //         if (ws) {
    //             const res = { ledger: this.ledgerService.convertServerLedgerToUILedger() };
    //             const jsonRes = JSON.stringify(res);
    //             ws.send(jsonRes);
    //         }
    //     }
    // }

    private processGameMessage(data: WebSocket.Data, clientUUID: string, gameInstanceUUID: string) {
        logger.info(`Incoming Game Message: ${data}`);
        if (typeof data === 'string') {
            try {
                const receivedMessageTime = Date.now();
                const action = JSON.parse(data);
                this.messageService.processMessage(action, gameInstanceUUID, clientUUID);
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

    initGameWSS() {
        this.wss = new WebSocket.Server({ server: this.server });
        this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
            const ip = req.connection.remoteAddress;
            logger.info(`ws connection req from ${ip}`);

            const parsedQuery = queryString.parseUrl(req.url);
            const clientUUID = parsedQuery.query.clientUUID as string;
            const gameUUID = parsedQuery.query.gameUUID as string;
            const endpoint = parsedQuery.query.endpoint as string;

            // TODO, I dont we should pass the endpoint in the body, rather match across the actual url
            switch (endpoint) {
                case EndPoint.GAME: {
                    this.onConnectionToGame(ws, gameUUID, clientUUID);
                    return;
                }
                case EndPoint.LEDGER: {
                    this.onConnectionToLedger(ws, gameUUID, clientUUID);
                    return;
                }
                default: {
                    logger.info(`no websocket interaction at url`);
                    ws.close(404, `no websocket interaction at url`);
                }
            }
        });
    }

    onConnectionToGame(ws: WebSocket, gameUUID: string, clientUUID: string) {
        // if game is not in instanceManager then send 404
        // TODO implement FE for this
        if (!this.gameInstanceManager.doesGameExist(gameUUID)) {
            ws.send(JSON.stringify(getDefaultGame404()));
            return;
        }
        // if a uuid was not sent by client (that is there is no session) then create one
        if (!clientUUID) {
            clientUUID = this.connectedClientManager.createClientSessionInGroup(gameUUID, ws);
        } else {
            // if there is a session replace old websocket
            this.connectedClientManager.updateClientSessionInGroup(gameUUID, clientUUID, ws);
        }
        logger.info(`Connected to clientUUID: ${clientUUID}, gameUUID: ${gameUUID}`);

        // add client to game instance
        this.gameInstanceManager.loadGameInstance(gameUUID);
        this.gameInstanceManager.addClientToGameInstance(gameUUID, clientUUID);

        //s end init state to newly connected client
        ws.send(JSON.stringify(this.stateConverter.getUIState(clientUUID, true)));

        // maybe this should be done else where?
        ws.on('message', (data: WebSocket.Data) => this.processGameMessage(data, clientUUID, gameUUID));
    }

    onConnectionToLedger(ws: WebSocket, gameUUID: string, clientUUID: string) {
        // todo only allow certian people to see ledger
        // must be in game? admin? have been in game?
        ws.send(JSON.stringify({ ledger: this.ledgerService.convertServerLedgerToUILedger() }));
    }

    //refactor this mess of a function
    init() {
        this.app = express();
        this.initHTTPRoutes();
        this.server = http.createServer(this.app);
        this.initGameWSS();
        this.stateGraphManager.observeStateGraphUpdates().subscribe(() => {
            this.sendGameUpdatesToClients();
            // this.sendLedgerUpdatesToClients();
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
