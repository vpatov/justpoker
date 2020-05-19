import { Service } from 'typedi';
import { printObj } from '../../../ui/src/shared/util/util';
@Service()
export class TimerManager {
    private stateTimer: NodeJS.Timer;

    getStateTimer() {
        return this.stateTimer;
    }

    loadStateTimer(st: NodeJS.Timer) {
        this.stateTimer = st;
    }

    setStateTimer(fn: Function, timeout: number) {
        if (this.stateTimer) {
            global.clearTimeout(this.stateTimer);
        }
        this.stateTimer = global.setTimeout(() => fn(), timeout);
    }

    cancelStateTimer() {
        global.clearTimeout(this.stateTimer);
    }
}
