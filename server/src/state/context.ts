import { Service } from 'typedi';
import { GameInstanceUUID, makeBlankUUID } from '../../../ui/src/shared/models/system/uuid';

@Service()
export class Context {
    private gameInstanceUUID: GameInstanceUUID = makeBlankUUID();

    constructor() {}

    getGameInstanceUUID(): GameInstanceUUID {
        return this.gameInstanceUUID;
    }

    load(gameInstanceUUID: GameInstanceUUID) {
        this.gameInstanceUUID = gameInstanceUUID;
    }
}
