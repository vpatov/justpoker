import "reflect-metadata";
import { Service, Container } from "typedi";

import * as http from 'http';
import * as WebSocket from 'ws';
import express from 'express'
import bodyParser from "body-parser"
import request from 'request'
import cookie from 'cookie';

import { AddressInfo } from "net";
import { Action, SitDownRequest } from './models/wsaction';
import { MessageService } from './service/messageService';
import { PlayerService } from './service/playerService';
import { NewTableForm } from './models/table';
import { TableService } from './service/tableService';

@Service()
class Server {

    app: express.Application;
    server: http.Server;
    defaultPort = 8080;
    wss: WebSocket.Server;

    constructor(
        private messageService: MessageService,
        private playerService: PlayerService,
        private tableService: TableService, ) { }

    private initRoutes(): void {
        const router = express.Router()

        router.get('/', (req, res) => {
            res.send("Poker Web.");
        })

        /*
        I can't get this post request working for some reason.
        Gonna just do it as a get request instead for sake of progress.

        */
        router.post('/newgame', (req, res) => {
            console.log(req);
            const passedRequest: Request = req.body as Request

            console.log(passedRequest);

            request(passedRequest.url, (error: any, response: any, body: any) => {
                if (!error) {
                    const newTableForm: NewTableForm = JSON.parse(body) as NewTableForm
                    const tableUUID = this.tableService.initTable(newTableForm);
                    res.json(tableUUID);
                }
            });
        })

        // its probably okay to cut corners for now and bypass the game url
        // and just use the main game url for simplicity since there is only one game
        // happening right now

        // lol I spent an hour trying to get post working and
        // this took me less than a minute
        // http://localhost:8080/newgameget?bigBlind=3&smallBlind=1&gameType=NLHOLDEM&password=abc
        router.get('/newgameget', (req, res) => {
            const newTableForm = {
                smallBlind: req.query.smallBlind,
                bigBlind: req.query.bigBlind,
                gameType: req.query.gameType,
                password: req.query.password
            };
            const tableUUID = this.tableService.initTable(newTableForm);
            res.send(tableUUID);
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


        /* TODO look at
        https://livebook.manning.com/book/typescript-quickly/chapter-10/v-9/233
        where he has a baseclass for a MessageServer, that other MessageServers
        can extend. it could be a good idea to have a separate server for
        different types of actions
        */

        this.wss.on('connection', (ws: WebSocket, req) => {
            const ip = req.connection.remoteAddress;
            console.log("connected to ip:", ip);

            console.log("req", req.headers);

            const userCookieID = cookie.parse(req.headers.cookie).id;
            console.log(userCookieID);

            // get the connectedClient (or make one)
            // const connectedClient = getConnectedClient(userCookieID);

            ws.on('message', (data: WebSocket.Data) => {
                console.log("Incoming:", data);
                if (typeof data === 'string') {
                    try {
                        const action = JSON.parse(data);
                        const res = this.messageService
                            .processMessage(action, userCookieID);
                        ws.send(res);
                    }
                    catch (e) {
                        console.log("Couldn't parse data.");
                        ws.send("Couldn't parse data.");
                    }

                } else {
                    console.log('Received data of unsupported type.');
                }
            });

            ws.send('You have connected to the websocket server.');

        });

        this.server.listen(process.env.PORT || this.defaultPort, () => {
            const port = this.server.address() as AddressInfo;
            console.log(
                `Server started on address ${JSON.stringify(port)} :)`);
        });


    }
}

//   this.mountRoutes()
// }



const server = Container.get(Server);
server.init();