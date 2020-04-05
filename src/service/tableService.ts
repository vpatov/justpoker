import { Service } from "typedi";
import { Room } from '../models/gameState';
import { Player } from '../models/player';
import { NewTableForm } from '../models/table';
import { Table } from '../models/table';
import { PlayerService } from './playerService'
import { GameStateManager } from './gameStateManager';
import { generateUUID } from '../util/util';

@Service()
export class TableService {

    table: Table;


    constructor(
        private playerService: PlayerService,
        private gameStateManager: GameStateManager
    ) { }

    getTable() {
        return this.table;
    }

    // for now there is only one table object
    // in future this will be called createTable
    initTable(newTableForm: NewTableForm) {

        const uuid = generateUUID();

        this.gameStateManager.initGameState();
        this.gameStateManager.updateGameParameters({
            smallBlind: newTableForm.smallBlind,
            bigBlind: newTableForm.bigBlind,
            gameType: newTableForm.gameType,
        })

        // oH nO a pLaiNtEXt pAssW0Rd!!
        this.table = {
            uuid,
            activeConnections: new Map(),
            password: newTableForm.password,
        };

        return uuid;
    }


}