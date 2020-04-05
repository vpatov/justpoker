import { Board, GameParameters, GameType, BettingRound } from './game';
import { Player } from './player';
import { Table } from './table'
import { Deck } from './cards'

export declare interface GameState {
    players: ReadonlyMap<string, Player>;
    // players: { [key: string]: Player };
    board: Readonly<Board>;
    gameParameters: Readonly<GameParameters>;
    dealerPlayer: Readonly<string>;
    bigBlindPlayer: Readonly<string>;
    smallBlindPlayer: Readonly<string>;
    currentBettingRound: Readonly<BettingRound>;
    deck: Readonly<Deck>;
    table: Table;
}

export const cleanGameState: GameState = {
    players: new Map(),
    board: {
        cards: []
    },
    gameParameters: {
        smallBlind: 0,
        bigBlind: 0,
        gameType: GameType.NLHOLDEM,
    },
    dealerPlayer: '',
    smallBlindPlayer: '',
    bigBlindPlayer: '',
    currentBettingRound: BettingRound.WAITING,
    deck: {
        cards: []
    },
    table: {
        uuid: '',
        activeConnections: new Map(),
        password: '',
    }
}
