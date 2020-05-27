import { Service } from 'typedi';
import {
    ServerLedger,
    getCleanLedgerRow,
    UILedger,
    ServerLedgerRow,
    UILedgerRow,
} from '../../../ui/src/shared/models/ledger';
import { logger } from '../logger';
import { ClientUUID } from '../../../ui/src/shared/models/uuid';

/*
    TODO:
    Add subject that emits when ledger is updated.
    Add decorator to methods that update ledger, decorator calls fn that emits update from subject.
    Subscribe to subject in server, take ledgerService call out of gameState update emitter subscription.
*/
@Service()
export class LedgerService {
    private ledger: ServerLedger = {};

    /** Initiate the ledger row for the client. Called when client is initialized. */
    initRow(clientUUID: ClientUUID) {
        if (!this.getLedgerRow(clientUUID)) {
            this.ledger[clientUUID] = {
                ...getCleanLedgerRow(),
                clientUUID,
            };
        } else {
            logger.warning(`LedgerService.initRow was called on an already initialized client: ${clientUUID}`);
        }
    }

    clearLedger() {
        this.ledger = {};
    }

    getLedger() {
        return this.ledger;
    }

    loadLedger(ledger: ServerLedger) {
        this.ledger = ledger;
    }

    private getLedgerRow(clientUUID: ClientUUID): ServerLedgerRow {
        return this.ledger[clientUUID];
    }

    /**
     * Aliases (player names) are recorded during sitdown or name change via chat.
     */
    addAlias(clientUUID: ClientUUID, name: string): void {
        this.getLedgerRow(clientUUID).aliases.add(name);
    }

    /**
     * Buyins should be recorded when:
     *      - player fills out sit down form
     *      - player adds on more chips from menu
     */
    addBuyin(clientUUID: ClientUUID, buyin: number): void {
        this.getLedgerRow(clientUUID).buyins.push(buyin);
    }

    /**
     * Walkaway should be recorded when
     *      - player stands up (either manually or by being stacked)
     */
    addWalkaway(clientUUID: ClientUUID, walkaway: number): void {
        this.getLedgerRow(clientUUID).walkaways.push(walkaway);
    }

    private setTimeStartedPlaying(clientUUID: ClientUUID, timeStartedPlaying: number): void {
        this.getLedgerRow(clientUUID).timeStartedPlaying = timeStartedPlaying;
    }

    private setTimeMostRecentHand(clientUUID: ClientUUID, timeMostRecentHand: number): void {
        this.getLedgerRow(clientUUID).timeMostRecentHand = timeMostRecentHand;
    }

    setCurrentChips(clientUUID: ClientUUID, currentChips: number): void {
        this.getLedgerRow(clientUUID).currentChips = currentChips;
    }

    /** Helper method for incrementHandsWon. */
    incrementHandsWonForPlayers(clientUUIDs: Iterable<ClientUUID>): void {
        for (const clientUUID of clientUUIDs) {
            this.incrementHandsWon(clientUUID);
        }
    }

    /** Called everytime the client wins a hand. Incremented only once even if there are multiple pots. */
    incrementHandsWon(clientUUID: ClientUUID): void {
        this.getLedgerRow(clientUUID).handsWon += 1;
    }

    /** Called everytime the betting round stage reaches the flop, and the client is still in the game. */
    incrementFlopsSeen(clientUUID: ClientUUID): void {
        this.getLedgerRow(clientUUID).flopsSeen += 1;
    }

    /** Called everytime the client is dealt in preflop. timeStartedPlaying and timeMostRecentHand are handled here. */
    incrementHandsDealtIn(clientUUID: ClientUUID): void {
        const row = this.getLedgerRow(clientUUID);
        const currentTime = Date.now();
        if (row.handsDealtIn === 0) {
            this.setTimeStartedPlaying(clientUUID, currentTime);
        }
        this.setTimeMostRecentHand(clientUUID, currentTime);
        row.handsDealtIn += 1;
    }

    private convertServerLedgerRowToUILedgerRow(serverRow: ServerLedgerRow): UILedgerRow {
        const walkaway = serverRow.walkaways.reduce((sum, walkaway) => walkaway + sum, 0) + serverRow.currentChips;
        const totalBuyin = serverRow.buyins.reduce((sum, buyin) => buyin + sum, 0);
        const row: UILedgerRow = {
            aliases: [...serverRow.aliases].join(','),
            buyins: serverRow.buyins.map((buyin) => String(buyin)).join(','),
            walkaway,
            currentChips: serverRow.currentChips,
            timeStartedPlaying: serverRow.timeStartedPlaying,
            timeMostRecentHand: serverRow.timeMostRecentHand,
            handsWon: serverRow.handsWon,
            flopsSeen: serverRow.flopsSeen,
            handsDealtIn: serverRow.handsDealtIn,
            totalBuyin,
            net: walkaway - totalBuyin,
            vpip: serverRow.handsDealtIn && Math.round((serverRow.flopsSeen / serverRow.handsDealtIn) * 100),
        };
        return row;
    }

    convertServerLedgerToUILedger(ledger: ServerLedger): UILedger {
        const uiLedger: UILedger = Object.entries(ledger).map(([clientUUID, serverLedgerRow]) =>
            this.convertServerLedgerRowToUILedgerRow(serverLedgerRow),
        );
        return uiLedger;
    }
}
