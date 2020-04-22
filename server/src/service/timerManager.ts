import { Service } from 'typedi';
import { Subject } from 'rxjs';
import { GameState, ServerStateKeys } from '../../../ui/src/shared/models/gameState';
import { MessageService } from './messageService';

@Service()
export class TimerManager {
    private gameTimer: NodeJS.Timer;
    private updateEmitter: Subject<[GameState, Set<ServerStateKeys>]> = new Subject<
        [GameState, Set<ServerStateKeys>]
    >();

    globalTimerFn(fn: Function, getUpdate: () => GameState) {
        fn();
        this.updateEmitter.next([getUpdate(), new Set([ServerStateKeys.GAMESTATE, ServerStateKeys.AUDIO])]);
    }

    observeUpdates() {
        return this.updateEmitter.asObservable();
    }

    // TODO clear existing timers
    setTimer(fn: Function, getUpdateFn: () => GameState, timeout: number) {
        console.log('setTimer', fn, getUpdateFn, timeout);
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
}
