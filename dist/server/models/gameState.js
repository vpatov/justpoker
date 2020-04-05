"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanPublicGameState = {
    players: [],
    board: {
        cards: []
    },
    gameParameters: {
        smallBlind: 0,
        bigBlind: 0,
        gameType: "NLHOLDEM" /* NLHOLDEM */,
    },
    dealerPlayer: null,
    smallBlindPlayer: null,
    bigBlindPlayer: null,
    currentBettingRound: "WAITING" /* WAITING */,
};
exports.cleanSecureGameState = {
    gameState: exports.cleanPublicGameState,
    deck: {
        cards: []
    },
};
//# sourceMappingURL=gameState.js.map