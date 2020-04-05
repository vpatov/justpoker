import { Service } from "typedi";
import { Room } from '../models/gameState';
import { Player } from '../models/player';
import { NewTableForm } from '../models/game';


@Service()
export class TableService {

    table: Table;


    constructor(
        private playerService: PlayerService,
        private gameStateManager: GameStateManager
    ) { }


    // for now there is only one table object
    initTable(newTableForm: NewTableForm) {

        this.table = { ...cleanTable };

    }

}
