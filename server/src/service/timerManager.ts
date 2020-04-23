import { Service } from 'typedi';
import { Subject } from 'rxjs';
import { GameState, ServerStateKey } from '../../../ui/src/shared/models/gameState';

@Service()
export class TimerManager {
    private gameTimer: NodeJS.Timer;
    private updateEmitter: Subject<[GameState, Set<ServerStateKey>]> = new Subject<[GameState, Set<ServerStateKey>]>();

    globalTimerFn(fn: Function, getUpdate: () => GameState) {
        fn();
        // TODO perhaps timerManager can simply send all keys?
        this.updateEmitter.next([getUpdate(), new Set([ServerStateKey.GAMESTATE, ServerStateKey.AUDIO])]);
    }

    observeUpdates() {
        return this.updateEmitter.asObservable();
    }

    // TODO clear existing timers
    setTimer(fn: Function, getUpdateFn: () => GameState, timeout: number) {
        global.setTimeout(
            () => this.globalTimerFn(fn, getUpdateFn) /* Timer manager function that executes fn */,
            timeout /* Timeout value in ms */,
        );
    }

    // TODO showdown requires several timers. Redesign timer implementation to make it
    // more beautiful
    setPlayerTimer(fn: Function, getUpdateFn: () => GameState, timeout: number) {
        global.clearTimeout(this.gameTimer);
        this.gameTimer = global.setTimeout(
            () => this.globalTimerFn(fn, getUpdateFn) /* Timer manager function that executes fn */,
            timeout /* Timeout value in ms */,
        );
    }

    clearTimer() {
        global.clearTimeout(this.gameTimer);
    }
}
