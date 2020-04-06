// export declare interface UserAction {
// }

// export declare interface BetAction {

// }

export const enum ActionType {
    StartGame = 'StartGame',
    StopGame = 'StopGame',
    SitDown = 'SitDown',
    StandUp = 'StandUp',
    JoinTable = 'JoinTable',
    PingState = 'PingState',
    Check = 'Check',
    Bet = 'Bet',
    Raise = 'Raise',
    Fold = 'Fold',
    Call = 'Call',
    Chat = 'Chat',
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
