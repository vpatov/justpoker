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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const http = __importStar(require("http"));
const WebSocket = __importStar(require("ws"));
const messageService_1 = require("./service/messageService");
const playerService_1 = require("./service/playerService");
let Server = class Server {
    constructor(messageService, playerService) {
        this.messageService = messageService;
        this.playerService = playerService;
        this.defaultPort = 8080;
    }
    init() {
        this.app = express_1.default();
        this.app.use(body_parser_1.default.json());
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
            // const player = playerService.newPlayer("vasia");
            ws.on('message', (data) => {
                if (typeof data === 'string') {
                    try {
                        const action = JSON.parse(data);
                        const res = this.messageService.processMessage(action);
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
        this.app.get("/", (req, res) => {
            res.send("Poker Web.");
        });
        this.app.post('/newgame', function (req, res) {
            this.tableService.createNewTable(req.body);
            res.send("Dog added!");
        });
    }
};
Server = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [messageService_1.MessageService,
        playerService_1.PlayerService])
], Server);
const server = typedi_1.Container.get(Server);
server.init();
//# sourceMappingURL=server.js.map