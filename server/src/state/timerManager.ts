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

    /** There can only be one state timer per game instance live at any moment. */
    setStateTimer(fn: Function, timeout: number) {
        this.cancelStateTimer();
        this.timerGroup.stateTimer = global.setTimeout(() => fn(), timeout);
    }

    cancelStateTimer() {
        global.clearTimeout(this.timerGroup.stateTimer);
    }

    /** There can be multiple message announcement timers live per game instance simultaneously. */
    setMessageAnnouncementTimer(fn: Function, timeout: number) {
        global.setTimeout(() => fn(), timeout);
    }

    /** There can be only one tip message interval liver per game instance at any moment. */
    setTipMessageInterval(fn: Function, timeout: number) {
        this.timerGroup.tipMessageInterval = global.setInterval(() => fn(), timeout);
    }

    /** There can only be one time bank replenish timer per game instance live at any moment. */
    setTimeBankReplenishInterval(fn: Function, timeout: number) {
        this.cancelTimeBankReplenishTimer();
        this.timerGroup.timeBankReplenishTimer = global.setInterval(() => fn(), timeout);
    }

    cancelTimeBankReplenishTimer() {
        global.clearTimeout(this.timerGroup.timeBankReplenishTimer);
    }
}
