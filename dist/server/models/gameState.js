"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanGameState = {
    players: new Map(),
    board: {
        cards: []
    },
    gameParameters: {
        smallBlind: 0,
        bigBlind: 0,
        gameType: "NLHOLDEM" /* NLHOLDEM */,
    },
    dealerPlayer: '',
    smallBlindPlayer: '',
    bigBlindPlayer: '',
    currentBettingRound: "WAITING" /* WAITING */,
    deck: {
        cards: []
    },
    table: {
        uuid: '',
        activeConnections: new Map(),
        password: '',
    }
};
//# sourceMappingURL=gameState.js.map