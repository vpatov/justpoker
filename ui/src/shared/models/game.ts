import { Card } from "./cards";

export declare interface BettingRoundAction {
  type: BettingRoundActionType;
  amount?: number;
  // allin: boolean;
  // Is there a reason to set all in in this object?
  // the amount of chips the player bets will always
  // be equal to their stack if this is the case
}

// TODO re-evaluate semantics of WSAction vs BettingRoundAction vs lastActionType of Player
// and see if you can find a better design
// TODO re-evaluate semantics of WSAction vs BettingRoundAction vs lastActionType of Player
// and see if you can find a better design
export const enum BettingRoundActionType {
  // distinction between bet and call may be unnecessary
  CALL = "CALL",
  CHECK = "CHECK",
  BET = "BET",
  // distinction between bet and raise may be unnecessary
  // RAISE = 'RAISE',
  FOLD = "FOLD",
  WAITING_TO_ACT = "WAITING_TO_ACT",
  NOT_IN_HAND = "NOT_IN_HAND",
  ALL_IN = "ALL_IN",
  PLACE_BLIND = "PLACE_BLIND",
}

export declare interface GameParameters {
  smallBlind: number;
  bigBlind: number;
  gameType: GameType;
  timeToAct: number;
  maxPlayers: number;
  // add these later
  // straddleType: StraddleType;
  // ante: number;
}

export const enum StraddleType {
  NoStraddle = "NoStraddle",
  MississipiStraddle = "MississipiStraddle",
  NormalStraddle = "NormalStraddle",
}

// These are the community cards
// export declare interface Board {
//   cards: Card[];
// }

export const enum GameType {
  LHOLDEM = "LHOLDEM",
  NLHOLDEM = "NLHOLDEM",
  PLOMAHA = "PLOMAHA",
}

// The usage of this enum might need to change
// if expanding app to beyond nlholdem and plo
export const enum BettingRoundStage {
  WAITING = "WAITING",
  PREFLOP = "PREFLOP",
  FLOP = "FLOP",
  TURN = "TURN",
  RIVER = "RIVER",
  SHOWDOWN = "SHOWDOWN",
}

export const BETTING_ROUND_STAGES = [
  BettingRoundStage.WAITING,
  BettingRoundStage.PREFLOP,
  BettingRoundStage.FLOP,
  BettingRoundStage.TURN,
  BettingRoundStage.RIVER,
  BettingRoundStage.SHOWDOWN,
];

export const CHECK_ACTION: BettingRoundAction = {
  type: BettingRoundActionType.CHECK,
};

export const FOLD_ACTION: BettingRoundAction = {
  type: BettingRoundActionType.FOLD,
};

export const WAITING_TO_ACT: BettingRoundAction = {
  type: BettingRoundActionType.WAITING_TO_ACT,
};

export const CALL_ACTION: BettingRoundAction = {
  type: BettingRoundActionType.CALL,
};
