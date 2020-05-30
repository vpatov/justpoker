import { Service } from 'typedi';
import {GameInstanceLog, getCleanGameInstanceLog} from '../../../ui/src/shared/models/handLog';
import { GameInstanceUUID } from '../../../ui/src/shared/models/uuid';


@Service()
export class GameInstanceLogService {

    private gameInstanceLog: GameInstanceLog;

    initGameInstanceLog(gameInstanceUUID: GameInstanceUUID): void {        
        this.gameInstanceLog = {
            ...getCleanGameInstanceLog(),
            gameInstanceUUID
        };
    }

    getGameInstanceLog(): GameInstanceLog {
        return this.gameInstanceLog;
    }

    loadGameInstanceLog(gameInstanceLog: GameInstanceLog): void {
        this.gameInstanceLog = gameInstanceLog;
    }



}