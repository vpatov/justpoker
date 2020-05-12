
export declare interface BaseLedgerRow {
    /** A set of (case insensitive) aliases that the client has named their players, i.e. "Vas", "Vasia" .*/
    aliases: Set<string>;

    /** The list of buyins the client has completed. */
    buyins: number[];

    /** Everytime the client leaves the table with some amount, that amount is pushed here. */
    walkaways: number[];

    /**
     * The number of chips the client's player currently has, such that net can be calculated 
     * at any moment.
     */
    currentChips: number;

    /** The timestamp when the player was first dealt in for the game. */
    timeStartedPlaying: number;

    /** The timestamp when the player was last dealt in for the game. */
    timeMostRecentHand: number;

    /** The amount of hands (not pots) they've won. */
    handsWon: number;

    /** The amount of hands the player has seen the flop of. Used to calculate VPIP. */
    flopsSeen: number;

    /** The total amount of hands a player has been dealt in for. */
    handsDealtIn: number;
}

export declare interface ServerOnlyLedgerFields {
    /** The uuid of the client. */
    clientUUID: string;
}

export declare interface LedgerComputedFields {
    /** The sum of the buyins for the client. */
    totalBuyin: number;

    /** The sum of the walkaways for the client. */
    walkaway: number;

    /** The net profit/loss for the session -> walkaway - totalBuyin */
    net: number;

    /** Voluntarily Put Money In Pot: ratio of flops seen / hands dealt in.
     * Ranges from 0 (no flops seen) to 1 (all flops seen). */
    vpip: number;
}

/**
 * A server-side representation of a ledger row. Contains the sensitive clientUUID field,
 * which will be stripped during conversion to UILedgerRow. Variables like vpip and net,
 * which depend only on properties in the row, will be calculated during conversion.
 */
export declare type ServerLedgerRow = BaseLedgerRow & ServerOnlyLedgerFields;
export declare type ServerLedger = {[clientUUID: string]: ServerLedgerRow};

/** 
 * Representation of a ledger row that is used in the frontend to visually present 
 * the data.
 */
export declare type UILedgerRow = BaseLedgerRow & LedgerComputedFields;
export declare type UILedger = {[clientUUID: string]: UILedgerRow};


 export function getCleanLedgerRow(): ServerLedgerRow {
    return {
        clientUUID: '',
        aliases: new Set<string>(),
        buyins: [],
        walkaways: [],
        currentChips: 0,
        timeStartedPlaying: 0,
        timeMostRecentHand: 0,
        handsWon: 0,
        flopsSeen: 0,
        handsDealtIn: 0
    };
}