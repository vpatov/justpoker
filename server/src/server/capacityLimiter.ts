import { Service } from 'typedi';
import { Capacity, getDefaultCapacity } from '../../../ui/src/shared/models/system/capacity';
import { ConnectedClientManager } from './connectedClientManager';

@Service()
export class CapacityLimiter {
    private capacity: Capacity = getDefaultCapacity();
    constructor(private readonly connectedClientManager: ConnectedClientManager) {}

    getCapacity(): Capacity {
        return this.capacity;
    }

    isOverCapacity(): boolean {
        return this.connectedClientManager.getNumberOfClients() >= this.capacity.maxActiveWs;
    }

    setMaxWsCapacity(maxWS: number): void {
        this.capacity.maxActiveWs = maxWS;
    }
}
