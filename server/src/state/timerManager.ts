import { Service } from 'typedi';
import { getCleanTimerGroup, TimerGroup, PauseableTimer } from '../../../ui/src/shared/models/state/timers';
import { logger } from '../logger';

@Service()
export class TimerManager {
    private timerGroup: TimerGroup = getCleanTimerGroup();

    getTimerGroup() {
        return this.timerGroup;
    }

    loadTimerGroup(timerGroup: TimerGroup) {
        this.timerGroup = timerGroup;
    }

    setMessageAnnouncementTimer(fn: Function, timeout: number) {
        this.timerGroup.messageAnnouncementTimer = new PauseableTimer(() => fn(), timeout);
    }

    /** There can only be one stateTimer per game instance live at any moment. */
    setStateTimer(fn: Function, timeout: number) {
        this.cancelStateTimer();
        this.timerGroup.stateTimer = new PauseableTimer(() => fn(), timeout);
    }
    cancelStateTimer() {
        if (this.timerGroup.stateTimer !== null) this.timerGroup.stateTimer.clear();
    }

    /** There can only be one timeBankReplenish timer per game instance live at any moment.*/
    setTimeBankReplenishInterval(fn: Function, timeout: number) {
        this.cancelTimeBankReplenishTimer();
        this.timerGroup.timeBankReplenishTimer = new PauseableTimer(() => fn(), timeout, true);
    }
    pauseTimeBankReplenishTimer() {
        if (this.timerGroup.timeBankReplenishTimer !== null) this.timerGroup.timeBankReplenishTimer.pause();
    }
    startTimeBankReplenishTimer() {
        if (this.timerGroup.timeBankReplenishTimer !== null) this.timerGroup.timeBankReplenishTimer.start();
    }
    cancelTimeBankReplenishTimer() {
        if (this.timerGroup.timeBankReplenishTimer !== null) this.timerGroup.timeBankReplenishTimer.clear();
    }

    /** There can only be one incrementBlindsSchedule timer per game instance live at any moment.*/
    setIncrementBlindsScheduleInterval(fn: Function, timeout: number) {
        this.cancelIncrementBlindsScheduleInterval();
        this.timerGroup.incrementBlindsScheduleTimer = new PauseableTimer(() => fn(), timeout, true);
    }
    pauseIncrementBlindsScheduleInterval() {
        if (this.timerGroup.incrementBlindsScheduleTimer !== null) this.timerGroup.incrementBlindsScheduleTimer.pause();
    }
    startIncrementBlindsScheduleInterval() {
        if (this.timerGroup.incrementBlindsScheduleTimer !== null) this.timerGroup.incrementBlindsScheduleTimer.start();
    }
    cancelIncrementBlindsScheduleInterval() {
        if (this.timerGroup.incrementBlindsScheduleTimer !== null) this.timerGroup.incrementBlindsScheduleTimer.clear();
    }
}
