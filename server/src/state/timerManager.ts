import { Service } from 'typedi';
import { getCleanTimerGroup, TimerGroup } from '../../../ui/src/shared/models/state/timers';

@Service()
export class TimerManager {
    private timerGroup: TimerGroup = getCleanTimerGroup();

    getTimerGroup() {
        return this.timerGroup;
    }

    loadTimerGroup(timerGroup: TimerGroup) {
        this.timerGroup = timerGroup;
    }

    setStateTimer(fn: Function, timeout: number) {
        this.cancelStateTimer();
        this.timerGroup.stateTimer = global.setTimeout(() => fn(), timeout);
    }

    cancelStateTimer() {
        global.clearTimeout(this.timerGroup.stateTimer);
    }

    setMessageAnnouncementTimer(fn: Function, timeout: number) {
        this.timerGroup.messageAnnouncementTimer = global.setTimeout(() => fn(), timeout);
    }
}
