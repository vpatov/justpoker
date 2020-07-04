export declare interface TimerGroup {
    stateTimer: NodeJS.Timer | null;
    tipMessageInterval: NodeJS.Timer | null;
    timeBankReplenishTimer: NodeJS.Timer | null;
}

export function getCleanTimerGroup(): TimerGroup {
    return {
        stateTimer: null,
        tipMessageInterval: null,
        timeBankReplenishTimer: null,
    };
}
