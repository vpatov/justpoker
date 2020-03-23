import { GameParameters } from './models/game';
import { Player } from './models/player';


// TODO this could be base class that other game types extend
class Game {

    players: Player[];
    gameType: string; // TODO enum
    gameParameters: GameParameters;
    currentRound: any; // TODO Round

    /*
        constructor() {

        }


        // assuming that players are sitting at table, start gameplay
        startGame() {

        }

        // while waiting for game to start, players can join by sitting down.
        addPlayer() {


        }

    */
}
