import { getEpochTimeMs } from '../../util/util';

export declare interface TimerGroup {
    stateTimer: PauseableTimer | null;
    messageAnnouncementTimer: PauseableTimer | null;
    timeBankReplenishTimer: PauseableTimer | null;
    incrementBlindsScheduleTimer: PauseableTimer | null;
}

export function getCleanTimerGroup(): TimerGroup {
    return {
        stateTimer: null,
        messageAnnouncementTimer: null,
        timeBankReplenishTimer: null,
        incrementBlindsScheduleTimer: null,
    };
}

export class PauseableTimer {
    timer: NodeJS.Timer | null;
    timeStarted: number;
    timeRemaining: number;
    interval: number;
    reoccur: boolean;
    fn: any;
    paused: boolean;

    constructor(fn: any, interval: number, reoccur?: boolean) {
        this.timer = null;
        this.timeStarted = getEpochTimeMs();
        this.timeRemaining = interval;
        this.interval = interval;
        this.reoccur = reoccur || false;
        this.fn = fn;
        this.paused = true;
        this.start();
    }

    pause() {
        if (!this.paused) {
            this.paused = true;
            const now = getEpochTimeMs();
            const timeElapsed = now - this.timeStarted;
            this.timeRemaining -= timeElapsed;
            clearTimeout(this.timer as any);
        }
    }

    start(reoccuring?: boolean) {
        if (this.paused || reoccuring) {
            this.paused = false;
            this.timeStarted = getEpochTimeMs();
            this.timer = setTimeout(() => {
                this.timeRemaining = this.interval;
                this.fn();
                if (this.reoccur) this.start(true);
            }, this.timeRemaining);
        }
    }

    clear() {
        clearTimeout(this.timer as any);
    }
}
