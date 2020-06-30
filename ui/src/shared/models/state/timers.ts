export declare interface TimerGroup {
    stateTimer: NodeJS.Timer | null;
    messageAnnouncementTimer: NodeJS.Timer | null;
}

export function getCleanTimerGroup(): TimerGroup {
    return {
        stateTimer: null,
        messageAnnouncementTimer: null,
    };
}
