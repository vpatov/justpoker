"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanGameState = {
    players: {},
    board: {
        cards: []
    },
    gameParameters: {
        smallBlind: 0,
        bigBlind: 0,
        gameType: "NLHOLDEM" /* NLHOLDEM */,
        timeToAct: 0,
        maxPlayers: 9,
    },
    dealerUUID: '',
    smallBlindUUID: '',
    bigBlindUUID: '',
    bettingRoundStage: "WAITING" /* WAITING */,
    // bettingRoundActions: [],
    currentPlayerToAct: '',
    gameInProgress: false,
    deck: {
        cards: []
    },
    table: {
        uuid: '',
        activeConnections: new Map(),
        password: '',
    },
    serverTime: 0,
};
//# sourceMappingURL=gameState.js.map