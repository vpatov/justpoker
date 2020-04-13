import { BettingRoundAction } from "../models/game";

// export declare interface UserAction {
// }

// export declare interface BetAction {

// }

// export declare interface UserAction {
// }
// export declare interface BetAction {
// }
export const enum ActionType {
  STARTGAME = "STARTGAME",
  STOPGAME = "STOPGAME",
  SITDOWN = "SITDOWN",
  STANDUP = "STANDUP",
  JOINTABLE = "JOINTABLE",
  JOINTABLEANDSITDOWN = "JOINTABLEANDSITDOWN",
  PINGSTATE = "PINGSTATE",
  CHECK = "CHECK",
  BET = "BET",
  RAISE = "RAISE",
  FOLD = "FOLD",
  CALL = "CALL",
  CHAT = "CHAT",
  SETCHIPSDEBUG = "SETCHIPSDEBUG",
}

export declare interface SitDownRequest {
  seatNumber: number;
  // waitForBlind: boolean;
}

export declare interface JoinTableRequest {
  name: string;
  buyin: number;
  // admin: boolean;
  // sitdown: boolean;
  // password?: string;
}

export declare interface IncomingClientWsMessage {
  actionType: ActionType;
  sitDownRequest: SitDownRequest;
  joinTableRequest: JoinTableRequest;
  joinTableAndSitDownRequest: SitDownRequest & JoinTableRequest;
  bettingRoundAction: BettingRoundAction;
  debugMessage: any;
}

/*
gameplay actions:
Check
Bet XX
Raise XX
Fold
Show hole card


Host actions
Start game
edit game
Edit chips


user actions:
sit down
stand up
buy-in
top-off

*/
