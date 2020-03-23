// export declare interface UserAction {
// }

// export declare interface BetAction {

// }

export const enum ActionType {
    StartGame = 'StartGame',
    StopGame = 'StopGame',
    SitDown = 'SitDown',
    StandUp = 'StandUp',
}

export declare interface SitDownRequest {
    seatNumber: number;
    requestedChips: number;
    notes: string;
    waitForBlind: boolean;
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
