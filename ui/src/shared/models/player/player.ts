import { Card, Hand } from '../game/cards';
import { BettingRoundActionType } from '../game/betting';
import { PlayerUUID, makeBlankUUID } from '../system/uuid';
import { AvatarKeys } from '../ui/assets';

export declare interface Player {
    /** Unique identifier for player. */
    readonly uuid: PlayerUUID;

    /** Player's display name at the table. */
    name: string;

    /** Amount of chips that the player has. (Rename to stack?) */
    chips: number;

    /** Player's hole cards. */
    holeCards: ReadonlyArray<Card>;

    /** Cards that make up the player's best hand.*/
    bestHand: Hand | null;

    /**
     * If a player is sitting they are either playing/have played
     * in the current hand, or are waiting to be dealt in the next hand.
     */
    sitting: boolean;

    /** Player is at the table but not being dealt in. */
    sittingOut: boolean;

    /** Player will leave table after hand. */
    quitting: boolean;

    /** Whether player's ws is closed. */
    disconnected: boolean;

    /** If this is true, player will straddle when they are in position to do so. */
    willStraddle: boolean;

    /** Gameplay goes from lower seat number to higher seat number and wraps around. */
    seatNumber: number;

    /** If this player must post a big blind next hand */
    willPostBlind: boolean;

    /**
     * The last action that the player has performed (check, bet, etc.) If they are in the
     * current hand, but have not acted yet, lastAction.type === WAITING_TO_ACT.
     */
    lastActionType: BettingRoundActionType;

    /** Is set to true when the player has won the hand. */
    winner: boolean;

    /** The amount of chips the player is about to put into the pot. */
    betAmount: number;

    /** The total amount of chips the player has won or lost during this hand. */
    chipDelta: number;

    /** Used to calculate chipDelta. */
    chipsAtStartOfHand: number;

    /** Amount of timebanks that the player has left that they can use. */
    timeBanksLeft: number;

    /** Indicates which avatar the player is using */
    avatarKey: AvatarKeys;
}

export function getCleanPlayer(): Player {
    return {
        uuid: makeBlankUUID(),
        name: '',
        chips: 0,
        holeCards: [],
        bestHand: null,
        sitting: false,
        sittingOut: false,
        quitting: false,
        disconnected: false,
        willPostBlind: false,
        willStraddle: false,
        seatNumber: -1,
        lastActionType: BettingRoundActionType.NOT_IN_HAND,
        winner: false,
        betAmount: 0,
        chipsAtStartOfHand: 0,
        chipDelta: 0,
        timeBanksLeft: 0,
        avatarKey: AvatarKeys.shark,
    };
}
