import { BettingRoundStage, BettingRoundAction, BettingRoundActionType, Pot } from '../game/betting';
import { GameParameters, ConnectedClient } from '../game/game';
import { GameStage } from '../game/stateGraph';
import { Player } from '../player/player';
import { Card, Deck, Hand } from '../game/cards';
import { ClientUUID, PlayerUUID, makeBlankUUID } from '../system/uuid';
import { getCleanGameParameters } from '../game/game';
import { QueuedServerAction } from '../system/server';
import { PlayerPosition } from '../player/playerPosition';

export declare interface ActivePlayerSeat {
    playerUUID: PlayerUUID;
    seatNumber: number;
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
    activePlayerSeats: ActivePlayerSeat[];

    dealerSeatNumber: number;

    currentPlayerToActPosition: number;

    playerPositionMap: Map<PlayerUUID, PlayerPosition>;

    dealerUUID: PlayerUUID;

    smallBlindUUID: PlayerUUID;

    bigBlindUUID: PlayerUUID;

    straddleUUID: PlayerUUID;

    // used to see who should post blinds
    prevBigBlindUUID: PlayerUUID;

    // playerUUID of last player to bet or raise
    lastAggressorUUID: PlayerUUID;

    bettingRoundStage: BettingRoundStage;

    firstToAct: PlayerUUID;

    currentPlayerToActUUID: PlayerUUID;

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

    /** The size of the bet of the last aggressor. It will not include callers and partial all-ins. */
    previousRaise: number;

    /** The extra amount put into the pot by an all-in that was below the min-raise. */
    partialAllInLeftOver: number;

    /** The number of the current hand. Starts at 0. */
    handNumber: number;
}

// TODO create partially clean game that can be used to clear state of round info.
export function getCleanGameState(): GameState {
    return {
        gameStage: GameStage.NOT_IN_PROGRESS,
        queuedServerActions: [],
        players: {},
        board: [],
        gameParameters: getCleanGameParameters(),
        activePlayerSeats: [],
        dealerSeatNumber: 0,
        currentPlayerToActPosition: 0,
        playerPositionMap: new Map(),
        dealerUUID: makeBlankUUID(),
        smallBlindUUID: makeBlankUUID(),
        bigBlindUUID: makeBlankUUID(),
        straddleUUID: makeBlankUUID(),
        prevBigBlindUUID: makeBlankUUID(),
        lastAggressorUUID: makeBlankUUID(),
        bettingRoundStage: BettingRoundStage.WAITING,
        firstToAct: makeBlankUUID(),
        admins: [],
        currentPlayerToActUUID: makeBlankUUID(),
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
        partialAllInLeftOver: 0,
        handNumber: -1,
    };
}
