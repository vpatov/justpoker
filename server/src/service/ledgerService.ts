import { Service } from 'typedi';
import { ServerLedger, getCleanLedgerRow } from '../../../ui/src/shared/models/ledger';

@Service()
export class LedgerService {
    private ledger: ServerLedger = {};

    /** Initiate the ledger row for the client. Called when client is initialized. */
    initRow(clientUUID: string) {
        if (!this.getLedgerRow(clientUUID)) {
            this.ledger[clientUUID] = {
                ...getCleanLedgerRow(),
                clientUUID,
            };
        }
        console.log(`WARNING: ledgerService.initRow was called on an already initialized client: ${clientUUID}`);
    }

    getLedger() {
        return this.ledger;
    }

    private getLedgerRow(clientUUID: string) {
        return this.ledger[clientUUID];
    }

    /**
     * Aliases (player names) are recorded during sitdown or name change via chat.
     */
    addAlias(clientUUID: string, name: string) {
        this.getLedgerRow(clientUUID).aliases.add(name);
    }

    /**
     * Buyins should be recorded when:
     *      - player fills out sit down form
     *      - player adds on more chips from menu
     */
    addBuyin(clientUUID: string, buyin: number) {
        this.getLedgerRow(clientUUID).buyins.push(buyin);
    }

    /**
     * Walkaway should be recorded when
     *      - player stands up (either manually or by being stacked)
     */
    addWalkaway(clientUUID: string, walkaway: number) {
        this.getLedgerRow(clientUUID).walkaways.push(walkaway);
    }

    private setTimeStartedPlaying(clientUUID: string, timeStartedPlaying: number) {
        this.getLedgerRow(clientUUID).timeStartedPlaying = timeStartedPlaying;
    }

    private setTimeMostRecentHand(clientUUID: string, timeMostRecentHand: number) {
        this.getLedgerRow(clientUUID).timeMostRecentHand = timeMostRecentHand;
    }

    setCurrentChips(clientUUID: string, currentChips: number) {
        this.getLedgerRow(clientUUID).currentChips = currentChips;
    }

    /** Helper method for incrementHandsWon. */
    incrementHandsWonForPlayers(clientUUIDs: Iterable<string>) {
        for (const clientUUID of clientUUIDs) {
            this.incrementHandsWon(clientUUID);
        }
    }

    /** Called everytime the client wins a hand. Incremented only once even if there are multiple pots. */
    incrementHandsWon(clientUUID: string) {
        this.getLedgerRow(clientUUID).handsWon += 1;
    }

    /** Called everytime the betting round stage reaches the flop, and the client is still in the game. */
    incrementFlopsSeen(clientUUID: string) {
        this.getLedgerRow(clientUUID).flopsSeen += 1;
    }

    /** Called everytime the client is dealt in preflop. timeStartedPlaying and timeMostRecentHand are handled here. */
    incrementHandsDealtIn(clientUUID: string) {
        const row = this.getLedgerRow(clientUUID);
        const currentTime = Date.now();
        if (row.handsDealtIn === 0) {
            this.setTimeStartedPlaying(clientUUID, currentTime);
        }
        this.setTimeMostRecentHand(clientUUID, currentTime);
        row.handsDealtIn += 1;
    }
}
