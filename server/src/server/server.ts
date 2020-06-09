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

import { ClientAction, Event, EventType, ClientWsMessage } from '../../../ui/src/shared/models/api';

import { logger, debugFunc } from '../logger';
import { ConnectedClientManager } from './connectedClientManager';
import { getDefaultGame404 } from '../../../ui/src/shared/models/uiState';
import { GameInstanceUUID, ClientUUID, generateClientUUID } from '../../../ui/src/shared/models/uuid';
import { GameParameters } from '../../../ui/src/shared/models/game';
import { CONFIGS, Config, ENVIRONMENT } from '../../../ui/src/shared/models/config';

console.log(process.env.NODE_SERVER_ENVIRONMENT);

@Service()
class Server {
    app: express.Application;
    server: http.Server;
    wss: WebSocket.Server;

    config: Config = process.env.NODE_SERVER_ENVIRONMENT === ENVIRONMENT.PROD ? CONFIGS.PROD : CONFIGS.DEV;

    rootServerDir = process.env.ROOT_SERVER_DIR || '';

    constructor(
        private eventProcessorService: EventProcessorService,
        private stateConverter: StateConverter,
        private readonly gameInstanceManager: GameInstanceManager,
        private readonly connectedClientManager: ConnectedClientManager,
    ) {}

    private initHTTPRoutes(): void {
        const router = express.Router();

        router.post('/api/createGame', (req, res) => {
            const gameParameters: GameParameters = req.body.gameParameters;
            const gameInstanceUUID = this.gameInstanceManager.createNewGameInstance(gameParameters);
            this.connectedClientManager.createNewClientGroup(gameInstanceUUID);

            logger.info(`Creating new game with gameInstanceUUID: ${gameInstanceUUID}`);
            res.send({ gameInstanceUUID: gameInstanceUUID });
        });

        router.get('/api/ledger', (req, res) => {
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

        // TODO replace with UIHandLog response when frontend and models are complete
        router.get('/api/handlog', (req, res) => {
            const parsedQuery = queryString.parseUrl(req.url);
            const gameInstanceUUID = parsedQuery.query.gameInstanceUUID as GameInstanceUUID;
            const clientUUID = parsedQuery.query.clientUUID as ClientUUID;
            const handLogs = this.gameInstanceManager.getHandLogsForGameInstance(gameInstanceUUID, clientUUID);
            if (!handLogs) {
                logger.info(`HandLog not found for ${gameInstanceUUID}`);
                res.send(getDefaultGame404());
            } else {
                res.send({ handLogs: handLogs });
            }
        });

        // This is necessary because the server npm scripts assume the build process happens in the server,
        // and the ts sources imports are relative to the server directory (when importing from ui/src/shared)
        if (this.rootServerDir) {
            logger.info('Serving static react files.');

            // Important that this is last, otherwise other get endpoints won't work.
            router.get('*', (req, res) => {
                res.sendFile(path.join(this.rootServerDir, 'ui', 'build', 'index.html'));
            });
            this.app.use(express.static(path.join(this.rootServerDir, 'ui', 'build')));
        }

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

    onConnectionToGame(ws: WebSocket, gameInstanceUUID: GameInstanceUUID, parsedClientUUID: ClientUUID) {
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

        ws.on('message', (data: WebSocket.Data) => this.processGameMessage(data, clientUUID, gameInstanceUUID));
        ws.on('close', (data: WebSocket.Data) => {
            logger.verbose(`WS closed for client ${clientUUID} in game ${gameInstanceUUID}`);
            const succ = this.connectedClientManager.removeClientFromGroup(gameInstanceUUID, clientUUID);
            if (!succ) {
                logger.verbose(
                    `Client ${clientUUID} not in group ${gameInstanceUUID}. Cannot remove from group. May have been deleted in other context.`,
                );
            }
        });
    }

    init() {
        this.app = express();
        this.initHTTPRoutes();
        this.server = http.createServer(this.app);
        this.initGameWSS();
        this.server.listen(this.config.SERVER_PORT, () => {
            const addressInfo = this.server.address() as AddressInfo;
            logger.info(`Server started on address `, addressInfo);
        });
    }
}

const server = Container.get(Server);
server.init();
