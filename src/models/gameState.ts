import { Board, GameParameters, GameType } from './game';
import { Player } from './player';
import { Deck } from './cards'

export declare interface PublicGameState {
    players: Player[];
    gameType: GameType;
    board: Board;
    gameParameters: GameParameters;
}

export declare interface SecureGameState {
    gameState: PublicGameState;
    deck: Deck;
}

// should game parameters be part of game state, room, or both?
export interface Room {
    hosts: Player[];
    players: Player[];
    gameParameters?: GameParameters;
}