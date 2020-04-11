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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typedi_1 = require("typedi");
const util_1 = __importDefault(require("util"));
const http = __importStar(require("http"));
const WebSocket = __importStar(require("ws"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_1 = __importDefault(require("cookie"));
const messageService_1 = require("./service/messageService");
const gameStateManager_1 = require("./service/gameStateManager");
const util_2 = require("./util/util");
let Server = class Server {
    constructor(messageService, gameStateManager) {
        this.messageService = messageService;
        this.gameStateManager = gameStateManager;
        this.defaultPort = 8080;
        this.tableInitialized = false;
    }
    initRoutes() {
        const router = express_1.default.Router();
        router.get('/', (req, res) => {
            res.send("Poker Web.");
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
                password: req.body.password
            };
            const tableId = this.gameStateManager.initGame(newGameForm);
            this.tableInitialized = true;
            console.log(tableId);
            res.send(JSON.stringify({ "tableId": tableId }));
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
            let clientId = '';
            try {
                clientId = cookie_1.default.parse(req.headers.cookie).id;
            }
            catch (e) {
                clientId = util_2.generateUUID();
            }
            console.log("clientId: ", clientId);
            this.gameStateManager.initConnectedClient(clientId);
            ws.send(JSON.stringify({
                status: 200,
                clientId: clientId,
            }));
            ws.send(JSON.stringify(this.messageService.getGameStateMessageForUI()));
            ws.on('message', (data) => {
                console.log("Incoming:", data);
                if (typeof data === 'string') {
                    // TODO populate error meaningfully
                    const error = '';
                    try {
                        const action = JSON.parse(data);
                        const res = this.messageService
                            .processMessage(action, clientId);
                        const jsonRes = JSON.stringify(res);
                        console.log(util_1.default.inspect(res, false, null, true));
                        ws.send(jsonRes);
                    }
                    catch (e) {
                        console.log(e);
                        ws.send(error);
                    }
                }
                else {
                    console.log('Received data of unsupported type.');
                }
            });
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