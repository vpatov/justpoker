import { Card } from "./cards";
import { BettingRoundAction } from "./game";

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
   * current hand, but have not acted yet, lastAction.type === WAITING_TO_ACT . This
   * property is used to determine whether a play is in a hand (rather than something like
   * an additional boolean "inHand").
   */
  readonly lastAction: BettingRoundAction | null;
}

/*
export declare interface PlayerGameData {
    // holeCards: Card[];
    // gameData: PlayerGameData;
    // potsWon: number;
    // vpip: number;
}
*/
