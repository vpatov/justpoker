import { Service } from 'typedi';
import { Subject } from 'rxjs';
import { GameState } from '../../../ui/src/shared/models/gameState';

@Service()
export class TimerManager {
    private gameTimer: NodeJS.Timer;
    private updateEmitter: Subject<GameState> = new Subject<GameState>();

    globalTimerFn(fn: Function, updateEmitter: Subject<GameState>, getUpdate: () => GameState) {
        fn();
        updateEmitter.next(getUpdate());
    }

    observeUpdates() {
        return this.updateEmitter.asObservable();
    }

    // TODO clear existing timers
    setTimer(fn: Function, getUpdateFn: () => GameState, timeout: number) {
        console.log('setTimer', fn, getUpdateFn, timeout);
        global.setTimeout(
            this.globalTimerFn /* Timer manager function that executes fn */,
            timeout /* Timeout value in ms */,
            fn /* Function passed in by caller of setTimer, contains game logic */,
            this.updateEmitter /* Subject to emit after function execution is complete */,
            getUpdateFn /* Function that returns value that should be emitted */,
        );
    }

    // TODO showdown requires several timers. Redesign timer implementation to make it
    // more beautiful
    setPlayerTimer(fn: Function, getUpdateFn: () => GameState, timeout: number) {
        global.clearTimeout(this.gameTimer);
        this.gameTimer = global.setTimeout(
            this.globalTimerFn /* Timer manager function that executes fn */,
            timeout /* Timeout value in ms */,
            fn /* Function passed in by caller of setTimer, contains game logic */,
            this.updateEmitter /* Subject to emit after function execution is complete */,
            getUpdateFn /* Function that returns value that should be emitted */,
        );
    }
}
