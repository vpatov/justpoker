export declare interface UserAction {
}

export declare interface BetAction {

}

export declare interface GameParameters {
  smallBlind: number;
  bigBlind: number;
  ante: number;
  timeToAct: number;
  gameType: string;
}

export declare enum ActionType {
  StartGame,
  StopGame

}

export declare interface Action {}


{"action": "startGame"}
{"action": "editGame", 
  "data": {
    "smallBlind": 20,
    "bigBlind": 40,
    "ante": null,
    "timeToAct": 45,
    "gameType": "holdem"
  }
};

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
