import { Service } from 'typedi';
import {ServerLedger, cleanLedgerRow} from "../../../ui/src/shared/models/table";

@Service()
export class LedgerService {

    ledger: ServerLedger = {};

    initRow(clientUUID: string){
        if (!this.getLedgerRow(clientUUID)){
            this.ledger[clientUUID] = {
                ...cleanLedgerRow,
                clientUUID
            };
        }
        console.log(`WARNING: ledgerService.initRow was called on an already initialized client: ${clientUUID}`);
    }
    
    getLedgerRow(clientUUID: string){
        return this.ledger[clientUUID];
    }

    addAlias(clientUUID: string, name: string){
        this.getLedgerRow(clientUUID).aliases.add(name);
    }

    addBuyin(clientUUID: string, buyin: number){
        this.getLedgerRow(clientUUID).buyins.push(buyin);
    }

    addWalkaway(clientUUID: string, walkaway: number){
        this.getLedgerRow(clientUUID).walkaways.push(walkaway);
    }

    setTimeStartedPlaying(clientUUID: string, timeStartedPlaying: number){
        this.getLedgerRow(clientUUID).timeStartedPlaying = timeStartedPlaying;
    }

    setTimeMostRecentHand(clientUUID: string, timeMostRecentHand: number){
        this.getLedgerRow(clientUUID).timeMostRecentHand = timeMostRecentHand;
    }

    incrementHandsWon(clientUUID: string){
        this.getLedgerRow(clientUUID).handsWon += 1;
    }

    incrementFlopsSeen(clientUUID: string){
        this.getLedgerRow(clientUUID).flopsSeen += 1;
    }

    incrementHandsDealtIn(clientUUID: string){
        this.getLedgerRow(clientUUID).handsDealtIn += 1;
    }
}
