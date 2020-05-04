import { Service } from 'typedi';

@Service()
export class TimerManager {
    private stateTimer: NodeJS.Timer;

    setStateTimer(fn: Function, timeout: number) {
        global.clearTimeout(this.stateTimer);
        this.stateTimer = global.setTimeout(() => fn(), timeout);
    }

    cancelStateTimer() {
        global.clearTimeout(this.stateTimer);
    }
}
