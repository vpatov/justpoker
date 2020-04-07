// export declare interface UserAction {
// }

// export declare interface BetAction {

// }

export const enum ActionType {
    STARTGAME = 'STARTGAME',
    STOPGAME = 'STOPGAME',
    SITDOWN = 'SITDOWN',
    STANDUP = 'STANDUP',
    JOINTABLE = 'JOINTABLE',
    PINGSTATE = 'PINGSTATE',
    CHECK = 'CHECK',
    BET = 'BET',
    RAISE = 'RAISE',
    FOLD = 'FOLD',
    CALL = 'CALL',
    CHAT = 'CHAT',
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


export declare interface Action {
    actionType: ActionType;
    data: any;
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
