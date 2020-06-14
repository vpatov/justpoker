import { ClientUUID, PlayerUUID } from '../system/uuid';

export declare interface GameParameters {
    smallBlind: number;
    bigBlind: number;
    gameType: GameType;
    maxBuyin: number;
    timeToAct: number;

    // advanced params

    maxPlayers: number;
    dynamicMaxBuyin: boolean;
    maxBuyinType: MaxBuyinType;
    minBuyin: number;
    allowTimeBanks: boolean;
    timeBankTime: number;
    numberTimeBanks: number;
    allowStraddle: boolean;
    canShowHeadsUp: boolean;
}

export enum MaxBuyinType {
    TopStack = 'TopStack',
    HalfTopStack = 'HalfTopStack',
    SecondStack = 'SecondStack',
    AverageStack = 'AverageStack',
}

export enum StraddleType {
    NoStraddle = 'NoStraddle',
    MississipiStraddle = 'MississipiStraddle',
    NormalStraddle = 'NormalStraddle',
}

export enum GameType {
    LHOLDEM = 'LHOLDEM',
    NLHOLDEM = 'NLHOLDEM',
    PLOMAHA = 'PLOMAHA',
}

export declare interface ConnectedClient {
    readonly uuid: ClientUUID;
    playerUUID: PlayerUUID;
}

export function getCleanGameParameters() {
    return {
        smallBlind: 0,
        bigBlind: 0,
        gameType: GameType.NLHOLDEM,
        maxBuyin: 0,
        minBuyin: 0,
        dynamicMaxBuyin: false,
        maxBuyinType: MaxBuyinType.TopStack,
        timeToAct: 0,
        maxPlayers: 0,
        timeBankTime: 0,
        numberTimeBanks: 0,
        allowTimeBanks: false,
        allowStraddle: false,
        canShowHeadsUp: false,
    };
}

export function getDefaultGameParameters() {
    return {
        smallBlind: 1,
        bigBlind: 2,
        gameType: GameType.NLHOLDEM,
        maxBuyin: 200,
        minBuyin: 50,
        dynamicMaxBuyin: false,
        maxBuyinType: MaxBuyinType.TopStack,
        timeToAct: 30,
        maxPlayers: 9,
        timeBankTime: 30,
        numberTimeBanks: 5,
        allowTimeBanks: true,
        allowStraddle: false,
        canShowHeadsUp: false,
    };
}