import { Service } from "typedi";
import { SecureGameState } from '../models/gameState';
import { StraddleType, GameType, GameParameters } from '../models/game';
import { Player } from '../models/player';
import { DeckService } from './deckService';
import { Observable, Subject } from 'rxjs';


@Service()
export class GameStateManager {

    gameState: SecureGameState;

    constructor(private deckService: DeckService) { }


    newGame(players: Player[]): SecureGameState {
        this.gameState =
        {
            gameState: {
                players,
                gameType: GameType.NoLimitTexasHoldEm,
                board: { cards: [] },
                gameParameters: {
                    smallBlind: 1,
                    bigBlind: 2,
                }

            },
            deck: this.deckService.newDeck(),
        };
        return this.gameState;
    }
}




    // export declare interface SecureGameState {
    // gameState: PublicGameState;
    // deck: Deck;


