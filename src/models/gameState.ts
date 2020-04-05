import { Board, GameParameters, GameType, BettingRound } from './game';
import { Player } from './player';
import { Deck } from './cards'

export declare interface GameState {
    players: ReadonlyArray<Player>;
    board: Readonly<Board>;
    gameParameters: Readonly<GameParameters>;
    dealerPlayer: Readonly<Player> | null;
    bigBlindPlayer: Readonly<Player> | null;
    smallBlindPlayer: Readonly<Player> | null;
    currentBettingRound: Readonly<BettingRound>;
    deck: Readonly<Deck>;
}


// should game parameters be part of game state, room, or both?
export interface Room {
    hosts: Player[];
    players: Player[];
    gameParameters?: GameParameters;
}

export const cleanGameState: GameState = {
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
    deck: {
        cards: []
    },
}
