import { Service } from "typedi";
import { GameState, cleanGameState } from '../models/gameState';
import { StraddleType, GameType, GameParameters, } from '../models/game';
import { Player } from '../models/player';
import { DeckService } from './deckService';
import { Observable, Subject } from 'rxjs';


@Service()
export class GameStateManager {

    gameState: Readonly<GameState>;

    constructor(private deckService: DeckService) { }

    getGameState(): GameState {
        return this.gameState;
    }

    initGameState() {
        this.gameState = { ...cleanGameState };
    }

    updateGameParameters(gameParameters: GameParameters) {
        this.gameState = {
            ...this.gameState,
            gameParameters: {
                ...gameParameters
            }
        };
    }


}

// https://github.com/goldfire/pokersolver




    // export declare interface SecureGameState {
    // gameState: PublicGameState;
    // deck: Deck;


