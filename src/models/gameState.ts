import { Board, GameParameters, GameType, BettingRound } from './game';
import { Player } from './player';
import { Deck } from './cards'

export declare interface PublicGameState {
    players: Player[];
    board: Board;
    gameParameters: GameParameters;
    dealerPlayer: Player | null;
    bigBlindPlayer: Player | null;
    smallBlindPlayer: Player | null;
    currentBettingRound: BettingRound;
}

export declare interface SecureGameState {
    gameState: PublicGameState;
    deck: Deck;
}

// should game parameters be part of game state, room, or both?
export interface Room {
    hosts: Player[];
    players: Player[];
    gameParameters?: GameParameters;
}

export const cleanPublicGameState: PublicGameState = {
    players: [],
    board: {
        cards: []
    },
    gameParameters: {
        smallBlind: 0,
        bigBlind: 0,
        gameType: GameType.NLHOLDEM,
    },
    dealerPlayer: null,
    smallBlindPlayer: null,
    bigBlindPlayer: null,
    currentBettingRound: BettingRound.WAITING,
}

export const cleanSecureGameState: SecureGameState = {
    gameState: cleanPublicGameState,
    deck: {
        cards: []
    },
};

