import { Service } from 'typedi';

export declare interface GlobalMetrics {
    gameInstances: { [key: string] : GameInstanceMetrics };
    timeServerStarted: number;
    exceptions: number;
}

export declare interface GameInstanceMetrics {
    timeStarted: number;
    lastActive: number;
    handsPlayed: number;
    maxNumPlayers: number;
}

@Service()
export class GlobalMetricsService {


}