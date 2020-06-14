import { Service } from 'typedi';

@Service()
export class TimerManager {
    private stateTimer: NodeJS.Timer;

    getStateTimer() {
        return this.stateTimer;
    }

    loadStateTimer(stateTimer: NodeJS.Timer) {
        this.stateTimer = stateTimer;
    }

    setStateTimer(fn: Function, timeout: number) {
        this.cancelStateTimer();
        this.stateTimer = global.setTimeout(() => fn(), timeout);
    }

    cancelStateTimer() {
        global.clearTimeout(this.stateTimer);
    }
}
