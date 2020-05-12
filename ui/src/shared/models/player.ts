import { Card, Hand } from './cards';
import { BettingRoundActionType } from './game';

export declare type PlayerUUID = string;

export declare interface Player {
    /** Unique identifier for player. */
    readonly uuid: PlayerUUID;

    /** Player's display name at the table. */
    readonly name: string;

    /** Amount of chips that the player has. (Rename to stack?) */
    readonly chips: number;

    /** Player's hole cards. */
    readonly holeCards: Card[];

    /** Label describing the best hand the player current holds. */
    readonly handDescription: string;

    /** Cards that make up the player's best hand.*/
    readonly bestHand: Hand|null;

    /**
     * If a player is sitting they are either playing/have played
     * in the current hand, or are waiting to be dealt in the next hand.
     */
    readonly sitting: boolean;

    /** Player is at the table but not being dealt in. */
    readonly sittingOut: boolean;

    /** If this is true, player will straddle when they are in position to do so. */
    readonly willStraddle: boolean;

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

    /** Whether or not the player's cards are publicly visible at the table. */
    readonly cardsAreHidden: boolean;

    /** The total amount of chips the player has won or lost during this hand. */
    readonly chipDelta: number;

    /** Used to calculate chipDelta. */
    readonly chipsAtStartOfHand: number;
}

export function getCleanPlayer(): Player {
    return {
        uuid: '',
        name: '',
        chips: 0,
        holeCards: [],
        handDescription: '',
        bestHand: null,
        sitting: false,
        sittingOut: false,
        willStraddle: false,
        seatNumber: -1,
        lastActionType: BettingRoundActionType.NOT_IN_HAND,
        winner: false,
        betAmount: 0,
        cardsAreHidden: true,
        chipsAtStartOfHand: 0,
        chipDelta: 0,
    };   
}
