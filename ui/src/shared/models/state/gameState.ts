import { BettingRoundStage, BettingRoundAction, BettingRoundActionType, Pot } from '../game/betting';
import { GameParameters, ConnectedClient } from '../game/game';
import { GameStage } from '../game/stateGraph';
import { Player } from '../player/player';
import { Card, Deck, Hand } from '../game/cards';
import { ClientUUID, PlayerUUID, makeBlankUUID } from '../system/uuid';
import { getCleanGameParameters } from '../game/game';
import { QueuedServerAction } from '../system/server';
import { PlayerPosition } from '../player/playerPosition';

/**
 * Represents a seat occupied by a player. Each playerSeat in the seatsDealtIn is a
 * snapshot of the seat at the beginning of the hand (so that when players switch seats
 * while a hand is in progress, the gameplay logic uses the snapshot rather than the
 * players' current positions).
 */
export declare interface PlayerSeat {
    playerUUID: PlayerUUID;

    /* Ranges from [0,maxNumPlayers), represents the absolute seat number. */
    seatNumber: number;

    /**
     * Ranges from [0, numPlayersDealtIn), represents the seats relative position with
     * respect to the current hand (0 -> dealer, 1 -> SB, so forth..)
     */
    positionIndex: number;
}

export declare interface GameState {
    gameStage: GameStage;

    queuedServerActions: QueuedServerAction[];

    /** Sensitive field. */
    // TODO when branded types can be used as index signatures, replace string with PlayerUUID
    players: { [key: string]: Player };

    board: Array<Card>;

    gameParameters: GameParameters;

    /**
     * Index into this array is the relative seat number (relative to the dealer). Dealer is at position 0.
     * Represents the seating arrangement at the start of the hand. This is the only data structure that deals
     * with relative seat numbers, all other objects use the absolute seat number (i.e. player.seatNumber, dealerSeatNumber)
     * */
    seatsDealtIn: PlayerSeat[];

    dealerSeatNumber: number;

    playerPositionMap: Map<PlayerUUID, PlayerPosition>;

    dealerSeat: PlayerSeat | undefined;

    isAllInRunOut: boolean;

    smallBlindSeat: PlayerSeat | undefined;

    bigBlindSeat: PlayerSeat | undefined;

    straddleSeat: PlayerSeat | undefined;

    // used to see who should post blinds
    prevBigBlindSeat: PlayerSeat | undefined;

    // playerUUID of last player to bet or raise
    lastAggressorUUID: PlayerUUID | undefined;

    // playerUUID of last player to bet greater than or equal to the current min raise
    // that is, it was not a partial all in raise
    lastFullRaiserUUID: PlayerUUID | undefined;

    bettingRoundStage: BettingRoundStage;

    firstToActSeat: PlayerSeat | undefined;

    currentPlayerSeatToAct: PlayerSeat | undefined;

    lastBettingRoundAction: BettingRoundAction;

    timeCurrentPlayerTurnStarted: number;

    /** Amount of timebanks that the player has used this turn. */
    timeBanksUsedThisAction: number;

    pots: Array<Pot>;

    /** After pots are awarded and the hand is over, this contains set of player uuids that have won a pot. */
    handWinners: Set<PlayerUUID>;

    winningHand?: Hand;

    /**
     * This variable is checked before initializing a new hand. If it's true, and there are enough players, the
     * gameStage will proceed to INITIALIZE_NEW_HAND, the hand will be dealt, and gameplay will start. Otherwise, the
     * gameStage will proceed to NOT_IN_PROGRESS. This variable does not represent whether the game is currently
     * in progress - that is determined by the gameStage !== NOT_IN_PROGRESS, exposed in gsm.isGameInProgress().
     */
    shouldDealNextHand: boolean;

    /** Sensitive field. */
    deck: Deck;

    /** Sensitive field. */
    admins: ClientUUID[];

    /** Sensitive field. */
    activeConnections: Map<ClientUUID, ConnectedClient>;

    /** Timestamp of server time when this state was processed. */
    serverTime: number;

    /** The minimum amount by which the next player can raise. */
    minRaiseDiff: number;

    /** The size of the bet of the last aggressor. It will not include callers but will include partial all-ins. */
    previousRaise: number;

    /** The number of the current hand. Starts at 0. */
    handNumber: number;

    /** The time the game was first started. */
    timeGameStarted: number;

    /** The index of the currently active blinds level in the blinds schedule . */
    currentBlindsLevel: number;
}

// TODO create partially clean game that can be used to clear state of round info.
export function getCleanGameState(): GameState {
    return {
        gameStage: GameStage.NOT_IN_PROGRESS,
        queuedServerActions: [],
        players: {},
        board: [],
        gameParameters: getCleanGameParameters(),
        seatsDealtIn: [],
        dealerSeatNumber: 0,
        isAllInRunOut: false,
        playerPositionMap: new Map(),
        dealerSeat: undefined,
        smallBlindSeat: undefined,
        bigBlindSeat: undefined,
        straddleSeat: undefined,
        prevBigBlindSeat: undefined,
        lastAggressorUUID: makeBlankUUID(),
        lastFullRaiserUUID: makeBlankUUID(),
        bettingRoundStage: BettingRoundStage.WAITING,
        firstToActSeat: undefined,
        admins: [],
        currentPlayerSeatToAct: undefined,
        lastBettingRoundAction: { type: BettingRoundActionType.NOT_IN_HAND },
        shouldDealNextHand: false,
        activeConnections: new Map(),
        deck: {
            cards: [],
        },
        pots: [],
        handWinners: new Set<PlayerUUID>(),
        timeCurrentPlayerTurnStarted: 0,
        timeBanksUsedThisAction: 0,
        serverTime: 0,
        minRaiseDiff: 0,
        previousRaise: 0,
        handNumber: -1,
        timeGameStarted: 0,
        currentBlindsLevel: 0,
    };
}
