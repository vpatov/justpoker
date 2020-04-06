import { Board, GameParameters, GameType, BettingRound } from './game';
import { Player } from './player';
import { Table } from './table'
import { Deck } from './cards'

export declare interface GameState {
    // players: ReadonlyMap<string, Player>;
    players: { [key: string]: Player };
    board: Readonly<Board>;
    gameParameters: Readonly<GameParameters>;
    dealerUUID: Readonly<string>;
    smallBlindUUID: Readonly<string>;
    bigBlindUUID: Readonly<string>;
    currentBettingRound: Readonly<BettingRound>;
    currentPlayerToAct: string;
    // seats: ReadonlyArray<[number, string]>,
    gameInProgress: boolean;
    deck: Readonly<Deck>;
    table: Table;
    serverTime: number;
}

export const cleanGameState: GameState = {
    players: {},
    board: {
        cards: []
    },
    gameParameters: {
        smallBlind: 0,
        bigBlind: 0,
        gameType: GameType.NLHOLDEM,
        timeToAct: 0,
        maxPlayers: 9,
    },
    dealerUUID: '',
    smallBlindUUID: '',
    bigBlindUUID: '',
    currentBettingRound: BettingRound.WAITING,
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
}
