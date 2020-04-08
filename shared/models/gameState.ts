import {
  Board,
  GameParameters,
  GameType,
  BettingRoundStage,
  BettingRoundAction,
} from "./game";
import { Player } from "./player";
import { Table } from "./table";
import { Deck } from "./cards";

export declare interface GameState {
  players: Readonly<{ [key: string]: Player }>;
  board: Readonly<Board>;
  gameParameters: Readonly<GameParameters>;
  dealerUUID: Readonly<string>;
  // smallBlindUUID: Readonly<string>;
  // bigBlindUUID: Readonly<string>;
  bettingRoundStage: Readonly<BettingRoundStage>;
  // bettingRoundActions: ReadonlyArray<BettingRoundAction>
  currentPlayerToAct: Readonly<string>;
  // seats: ReadonlyArray<[number, string]>,
  pots: ReadonlyArray<Pot>;
  gameInProgress: Readonly<boolean>;
  deck: Readonly<Deck>;
  table: Readonly<Table>;
  serverTime: Readonly<number>;
}

export declare interface Pot {
  value: number;
  contestors: ReadonlyArray<Player>;
}

export const cleanGameState: GameState = {
  players: {},
  board: {
    cards: [],
  },

  gameParameters: {
    smallBlind: 0,
    bigBlind: 0,
    gameType: GameType.NLHOLDEM,
    timeToAct: 0,
    maxPlayers: 9,
  },
  dealerUUID: "",
  // smallBlindUUID: '',
  // bigBlindUUID: '',
  bettingRoundStage: BettingRoundStage.WAITING,
  // bettingRoundActions: [],
  currentPlayerToAct: "",
  gameInProgress: false,
  deck: {
    cards: [],
  },
  pots: [],
  table: {
    uuid: "",
    activeConnections: new Map(),
    password: "",
  },
  serverTime: 0,
};
