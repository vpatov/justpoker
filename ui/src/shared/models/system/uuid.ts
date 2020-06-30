import hri from 'human-readable-ids';

/**
 * UUIDs are implemented as branded types. This allows for compile-time
 * checking to ensure uuids are not used incorrectly.
 * Inspiration taken from https://stackoverflow.com/a/61621026/3664123
 */

export declare type ClientUUID = string & { __brand: 'ClientUUID' };
export declare type PlayerUUID = string & { __brand: 'PlayerUUID' };
export declare type GameInstanceUUID = string & { __brand: 'GameInstanceUUID' };
export declare type UUID = ClientUUID & PlayerUUID & GameInstanceUUID;

export function generateUUID(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateHumanReadableId(): string {
    return hri.hri.random();
}

export function generatePlayerUUID(): PlayerUUID {
    return ('P_' + generateUUID()) as PlayerUUID;
}

export function generateGameInstanceUUID(): GameInstanceUUID {
    return generateHumanReadableId() as GameInstanceUUID;
}

export function generateClientUUID(): ClientUUID {
    return ('C_' + generateUUID()) as ClientUUID;
}

export function makeBlankUUID(): UUID {
    return '' as UUID;
}
