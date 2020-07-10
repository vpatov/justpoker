import 'reflect-metadata';
import { Service, Container } from 'typedi';

import * as http from 'http';
import * as WebSocket from 'ws';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import queryString from 'query-string';

import { AddressInfo } from 'net';
import { EventProcessorService } from '../io/eventProcessorService';
import { StateConverter } from '../io/stateConverter';
import { GameInstanceManager } from '../state/gameInstanceManager';

import {
    ClientAction,
    Event,
    EventType,
    ClientWsMessage,
    createWSCloseEvent,
    createServerMessageEvent,
} from '../../../ui/src/shared/models/api/api';

import { logger, debugFunc } from '../logger';
import { ConnectedClientManager } from './connectedClientManager';
import { getDefaultGame404 } from '../../../ui/src/shared/models/ui/uiState';
import { GameInstanceUUID, ClientUUID, generateClientUUID } from '../../../ui/src/shared/models/system/uuid';
import { GameParameters } from '../../../ui/src/shared/models/game/game';
import { ServerMessageType } from '../../../ui/src/shared/models/state/chat';
import { TimerManager } from '../state/timerManager';
import { Config, getServerEnvConfig } from '../../../ui/src/shared/models/config/config';
import * as uWS from 'uWebSockets.js';
import { readJson, ab2str2json, pipeStreamOverResponse } from './uWsUtils';
import * as fs from 'fs';

@Service()
class Server {
    app: uWS.TemplatedApp;
    server: http.Server;
    wss: WebSocket.Server;

    config: Config = getServerEnvConfig();

    rootServerDir = process.env.ROOT_SERVER_DIR || '';

    constructor(
        private eventProcessorService: EventProcessorService,
        private stateConverter: StateConverter,
        private readonly gameInstanceManager: GameInstanceManager,
        private readonly connectedClientManager: ConnectedClientManager,
        private readonly timerManager: TimerManager,
    ) {}

    private initHTTPRoutes() {
        const router = this.app;
        router.get('/health', (res, req) => {
            res.send('Great :)');
        });

        // router.get('/metrics',(res, req) => {
        //     const instanceUUIDs = this.gameInstanceManager.getAllGameInstanceUUIDs();
        //     const clientGroups = this.connectedClientManager.getClientGroups();

        //     const WScount = Object.values(clientGroups).reduce(
        //         (count, client) => count + Object.keys(client).length,
        //         0,
        //     );
        //     res.send({ gameCount: instanceUUIDs.length, activeWS: WScount, gameInstances: instanceUUIDs });
        // });

        // router.post('/api/error',(res, req) => {
        //     logger.error('Front-end reported error: ', req.body);
        // });

        router.post('/api/createGame', (res, req) => {
            readJson(
                res,
                (obj: any) => {
                    const body = obj;
                    const gameParameters: GameParameters = body.gameParameters;
                    const gameInstanceUUID = this.gameInstanceManager.createNewGameInstance(gameParameters);
                    this.connectedClientManager.createNewClientGroup(gameInstanceUUID);
                    this.timerManager.setMessageAnnouncementTimer(() => {
                        this.eventProcessorService.processEvent(
                            createServerMessageEvent(gameInstanceUUID, ServerMessageType.WELCOME),
                        );
                    }, 30 * 1000);

                    logger.info(`Creating new game with gameInstanceUUID: ${gameInstanceUUID}`);
                    res.end(JSON.stringify({ gameInstanceUUID: gameInstanceUUID }));
                },
                () => {
                    /* Request was prematurely aborted or invalid or missing, stop reading */
                    console.log('Invalid JSON or no data at all!');
                },
            );
        });

        // router.get('/api/ledger',(res, req) => {
        //     const parsedQuery = queryString.parseUrl(req.url);
        //     const gameInstanceUUID = parsedQuery.query.gameInstanceUUID as GameInstanceUUID;
        //     const ledger = this.gameInstanceManager.getLedgerForGameInstance(gameInstanceUUID);
        //     if (!ledger) {
        //         logger.info(`ledger not found for ${gameInstanceUUID}`);
        //         res.send(getDefaultGame404());
        //     } else {
        //         res.send({ ledger: ledger });
        //     }
        // });

        // // TODO replace with UIHandLog response when frontend and models are complete
        // router.get('/api/handlog',(res, req) => {
        //     const parsedQuery = queryString.parseUrl(req.url);
        //     const gameInstanceUUID = parsedQuery.query.gameInstanceUUID as GameInstanceUUID;
        //     const clientUUID = parsedQuery.query.clientUUID as ClientUUID;
        //     const handLogs = this.gameInstanceManager.getHandLogsForGameInstance(gameInstanceUUID, clientUUID);
        //     if (!handLogs) {
        //         logger.info(`HandLog not found for ${gameInstanceUUID}`);
        //         res.send(getDefaultGame404());
        //     } else {
        //         res.send({ handLogs: handLogs });
        //     }
        // });

        // This is necessary because the server npm scripts assume the build process happens in the server,
        // and the ts sources imports are relative to the server directory (when importing from ui/src/shared)
        if (this.rootServerDir) {
            logger.info('Serving static react files.');
            // Important that this is last, otherwise other get endpoints won't work.
            router.get('*', (res, req) => {
                const fileName = path.join(this.rootServerDir, 'ui', 'build', 'index.html');
                const totalSize = fs.statSync(fileName).size;
                const readStream = fs.createReadStream(fileName);
                pipeStreamOverResponse(res, readStream, totalSize);
            });
        }

        // this.app.use(bodyParser.json());
        // this.app.use(
        //     bodyParser.urlencoded({
        //         extended: true,
        //     }),
        // );
        // this.app.use('/', router);
    }

    @debugFunc()
    sendGameUpdatesToClients() {
        const activeGameInstanceUUID = this.gameInstanceManager.getActiveGameInstanceUUID();
        this.connectedClientManager.sendStateToEachInGroup(activeGameInstanceUUID);
    }

    @debugFunc()
    private processGameMessage(data: any, clientUUID: ClientUUID, gameInstanceUUID: GameInstanceUUID) {
        logger.verbose(`Incoming Game Message: ${data}`);
        try {
            const wsMessage: ClientWsMessage = data;
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
    }

    initGameWSS() {
        // this.wss = new WebSocket.Server({
        //     server: this.server,
        //     maxPayload: 100 * 100 * 1, // about 1 MB
        // });
        // this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
        //     const ip = req.connection.remoteAddress;
        //     logger.verbose(`WS connection request from: ${ip} on url: ${req.url}`);

        //     const parsedQuery = queryString.parseUrl(req.url);
        //     const clientUUID = parsedQuery.query.clientUUID as ClientUUID;
        //     const gameInstanceUUID = parsedQuery.query.gameInstanceUUID as GameInstanceUUID;

        //     this.onConnectionToGame(ws, gameInstanceUUID, clientUUID);
        //     return;
        // });

        this.app = uWS
            .App()
            .ws('/*', {
                /* Options */
                compression: uWS.SHARED_COMPRESSOR,
                maxPayloadLength: 16 * 1024 * 1024,
                idleTimeout: 0,
                /* Handlers */
                open: (ws) => {},
                message: (ws, message, isBinary) => {
                    const jsonMessage = ab2str2json(message);
                    const gameInstanceUUID = jsonMessage.gameInstanceUUID;
                    const clientUUID = jsonMessage.clientUUID;
                    if (jsonMessage.open) {
                        this.onConnectionToGame(ws, gameInstanceUUID, clientUUID);
                    } else {
                        this.connectedClientManager.setClientTimeMessaged(gameInstanceUUID, clientUUID);
                        this.processGameMessage(jsonMessage, clientUUID, gameInstanceUUID);
                    }
                },
                drain: (ws) => {
                    logger.info('WebSocket backpressure: ' + ws.getBufferedAmount());
                },
                close: (ws, code, message) => {},
            })
            .listen(this.config.SERVER_PORT, (token) => {
                if (token) {
                    console.log('Listening to port ' + this.config.SERVER_PORT);
                } else {
                    console.log('Failed to listen to port ' + this.config.SERVER_PORT);
                }
            });
    }

    onConnectionToGame(ws: uWS.WebSocket, gameInstanceUUID: GameInstanceUUID, parsedClientUUID: ClientUUID) {
        // if game is not in instanceManager then send 404
        if (!this.gameInstanceManager.doesGameInstanceExist(gameInstanceUUID)) {
            ws.send(JSON.stringify(getDefaultGame404()));
            return;
        }
        // if a uuid was not sent by client (that is there is no session) then create one
        const clientUUID = parsedClientUUID || generateClientUUID();
        if (!parsedClientUUID) {
            ws.send(JSON.stringify({ clientUUID }));
        }
        // this will either add client to group if not in group
        // or if in group will replace old websocket with new websocket
        const succ = this.connectedClientManager.addOrUpdateClientInGroup(gameInstanceUUID, clientUUID, ws);
        if (!succ) {
            logger.error(
                `Group ${gameInstanceUUID} does not exist. Group should have be init on create game. Client ${clientUUID} not added.`,
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
    }

    onWSClose(data: WebSocket.Data, clientUUID: ClientUUID, gameInstanceUUID: GameInstanceUUID) {
        logger.verbose(`WS closed for client ${clientUUID} in game ${gameInstanceUUID}`);
        const closeEvent = createWSCloseEvent(gameInstanceUUID, clientUUID);
        this.eventProcessorService.processEvent(closeEvent);

        const succ = this.connectedClientManager.removeClientFromGroup(gameInstanceUUID, clientUUID);
        if (!succ) {
            logger.verbose(
                `Client ${clientUUID} not in group ${gameInstanceUUID}. Cannot remove from group. May have been deleted in other context.`,
            );
        }
    }

    init() {
        logger.info('config', this.config);

        this.initGameWSS();
        this.initHTTPRoutes();
    }
}

const server = Container.get(Server);
server.init();
