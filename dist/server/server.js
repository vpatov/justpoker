"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typedi_1 = require("typedi");
const http = __importStar(require("http"));
const WebSocket = __importStar(require("ws"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_1 = __importDefault(require("cookie"));
const messageService_1 = require("./service/messageService");
const gameStateManager_1 = require("./service/gameStateManager");
let Server = class Server {
    constructor(messageService, gameStateManager) {
        this.messageService = messageService;
        this.gameStateManager = gameStateManager;
        this.defaultPort = 8080;
    }
    initRoutes() {
        const router = express_1.default.Router();
        router.get('/', (req, res) => {
            res.send("Poker Web.");
        });
        /*
        I can't get this post request working for some reason.
        Gonna just do it as a get request instead for sake of progress.

        */
        /*
        router.post('/newgame', (req, res) => {
            console.log(req);
            const passedRequest: Request = req.body as Request

            console.log(passedRequest);

            request(passedRequest.url, (error: any, response: any, body: any) => {
                if (!error) {
                    const newGameForm: NewGameForm = JSON.parse(body) as NewGameForm
                    const tableUUID = this.tableService.initTable(newGameForm);
                    res.json(tableUUID);
                }
            });
        })
        */
        // its probably okay to cut corners for now and bypass the game url
        // and just use the main game url for simplicity since there is only one game
        // happening right now
        // lol I spent an hour trying to get post working and
        // this took me less than a minute
        // http://localhost:8080/newgameget?bigBlind=3&smallBlind=1&gameType=NLHOLDEM&password=abc
        router.get('/newgameget', (req, res) => {
            const newGameForm = {
                smallBlind: req.query.smallBlind,
                bigBlind: req.query.bigBlind,
                gameType: req.query.gameType,
                password: req.query.password
            };
            const tableUUID = this.gameStateManager.initGame(newGameForm);
            res.send(tableUUID);
        });
        this.app.use(body_parser_1.default.json());
        this.app.use(body_parser_1.default.urlencoded({
            extended: true
        }));
        this.app.use('/', router);
    }
    init() {
        this.app = express_1.default();
        this.initRoutes();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ 'server': this.server });
        /* TODO look at
        https://livebook.manning.com/book/typescript-quickly/chapter-10/v-9/233
        where he has a baseclass for a MessageServer, that other MessageServers
        can extend. it could be a good idea to have a separate server for
        different types of actions
        */
        this.wss.on('connection', (ws, req) => {
            const ip = req.connection.remoteAddress;
            console.log("connected to ip:", ip);
            console.log("req", req.headers);
            const userCookieID = cookie_1.default.parse(req.headers.cookie).id;
            console.log(userCookieID);
            this.gameStateManager.initConnectedClient(userCookieID);
            // get the connectedClient (or make one)
            // const connectedClient = getConnectedClient(userCookieID);
            ws.on('message', (data) => {
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
                }
                else {
                    console.log('Received data of unsupported type.');
                }
            });
            ws.send('You have connected to the websocket server.');
        });
        this.server.listen(process.env.PORT || this.defaultPort, () => {
            const port = this.server.address();
            console.log(`Server started on address ${JSON.stringify(port)} :)`);
        });
    }
};
Server = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [messageService_1.MessageService,
        gameStateManager_1.GameStateManager])
], Server);
//   this.mountRoutes()
// }
const server = typedi_1.Container.get(Server);
server.init();
//# sourceMappingURL=server.js.map