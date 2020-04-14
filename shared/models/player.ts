import { Card } from "./cards";
import { BettingRoundAction, BettingRoundActionType } from "./game";

export declare interface Player {
  /** Unique identifier for player. */
  readonly uuid: string;

  /** Player's display name at the table. */
  readonly name: string;

  /** Amount of chips that the player has. (Rename to stack?) */
  readonly chips: number;

  /** Player's hole cards. */
  readonly holeCards: Card[];

  /**
   * If a player is sitting they are either playing/have played
   * in the current hand, or are waiting to be dealt in the next hand.
   */
  readonly sitting: boolean;

  /** Gameplay goes from lower seat number to higher seat number and wraps around. */
  readonly seatNumber: number;

  /**
   * The last action that the player has performed (check, bet, etc.) If they are in the
   * current hand, but have not acted yet, lastAction.type === WAITING_TO_ACT.
   */
  readonly lastActionType: BettingRoundActionType;

  /** Is set to true when the player has won the hand. */
  readonly winner: boolean;

  /** The amount of chips the player is about to put into the pot. */
  readonly betAmount: number;

  cardsAreHidden: boolean;
}

/*
export declare interface PlayerGameData {
    // holeCards: Card[];
    // gameData: PlayerGameData;
    // potsWon: number;
    // vpip: number;
}
*/
