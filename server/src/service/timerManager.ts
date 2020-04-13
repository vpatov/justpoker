import { Service } from 'typedi';
import { Subject } from 'rxjs';

@Service()
export class TimerManager {
    private gameTimer: NodeJS.Timer;
    private updateEmitter: Subject<void> = new Subject<void>();

    globalTimerFn(fn: Function, bindScope: any, updateEmitter: Subject<void>) {
        fn.bind(bindScope)();
        updateEmitter.next();
    }

    observeUpdates() {
        return this.updateEmitter.asObservable();
    }

    //TODO clear existing timers
    // TODO when end of round timer is activated, server should not accept any more turn to act state changes
    setTimer(bindScope: any, fn: Function, timeout: number) {
        this.gameTimer = global.setTimeout(
            this.globalTimerFn /* Timer manager function that executes fn */,
            timeout /* Timeout value in ms */,
            fn /* Function passed in by caller of setTimer, contains game logic */,
            bindScope /* bindScope is the object that called setTimer. Required to resolve "this" inside fn */,
            this.updateEmitter /* Subject to emit after function execution is complete */,
        );
    }
}
