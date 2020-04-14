import { Service } from 'typedi';
import { Subject } from 'rxjs';
import { GameState } from '../../../shared/models/gameState';

@Service()
export class TimerManager {
    private gameTimer: NodeJS.Timer;
    private updateEmitter: Subject<GameState> = new Subject<GameState>();

    globalTimerFn(
        fn: Function,
        bindScope: any,
        updateEmitter: Subject<GameState>,
        getUpdateScope: any,
        getUpdate: () => GameState,
    ) {
        debugger;
        fn.bind(bindScope)();
        updateEmitter.next(getUpdate.bind(getUpdateScope)());
    }

    observeUpdates() {
        return this.updateEmitter.asObservable();
    }

    // TODO clear existing timers
    // TODO when end of round timer is activated, server should not accept any more turn to act state changes
    // TODO cleaner design - instead of passing getUpdateFn, you could just pass the getUpdateScope, which will
    //      be expected to have a getUpdate function. (would that be cleaner)?
    setTimer(fnScope: any, fn: Function, getUpdateScope: any, getUpdateFn: () => GameState, timeout: number) {
        console.log('setTimer', fnScope, fn, getUpdateScope, getUpdateFn, timeout);
        global.setTimeout(
            this.globalTimerFn /* Timer manager function that executes fn */,
            timeout /* Timeout value in ms */,
            fn /* Function passed in by caller of setTimer, contains game logic */,
            fnScope /* fnScope is the object that called setTimer. Required to resolve "this" inside fn */,
            this.updateEmitter /* Subject to emit after function execution is complete */,
            getUpdateScope /* getUpdateScope is the scope used to execute the getUpateFn*/,
            getUpdateFn /* Function that returns value that should be emitted */,
        );
    }
}
