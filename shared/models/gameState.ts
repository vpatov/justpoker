import {
  GameParameters,
  GameType,
  BettingRoundStage,
  BettingRoundAction,
} from "./game";

import { Player } from "./player";
import { Table } from "./table";
import { Card, Deck } from "./cards";

export declare interface GameState {
  /** Sensitive field. */
  players: Readonly<{ [key: string]: Player }>;

  board: ReadonlyArray<Card>;

  gameParameters: Readonly<GameParameters>;

  dealerUUID: Readonly<string>;

  bettingRoundStage: Readonly<BettingRoundStage>;

  currentPlayerToAct: Readonly<string>;

  pots: ReadonlyArray<Pot>;

  gameInProgress: Readonly<boolean>;

  /* Sensitive field. */
  deck: Readonly<Deck>;

  /* Sensitive field. */
  table: Readonly<Table>;

  serverTime: Readonly<number>;

  // smallBlindUUID: Readonly<string>;
  // bigBlindUUID: Readonly<string>;
  // bettingRoundActions: ReadonlyArray<BettingRoundAction>
}

export declare interface Pot {
  value: number;
  contestors: ReadonlyArray<string>;
}

export const cleanGameState: GameState = {
  players: {},
  board: [],
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
