// UUIDs are implemented as branded types. This allows for compile-time checking to ensure
// uuids are not used incorrectly.
// Inspiration taken from https://stackoverflow.com/a/61621026/3664123


export declare type ClientUUID = string & { __brand: "ClientUUID"};
export declare type PlayerUUID = string & { __brand: "PlayerUUID"};
export declare type GameInstanceUUID = string & {__brand: "GameInstanceUUID"};
export declare type UUID = ClientUUID & PlayerUUID & GameInstanceUUID;

export declare interface PlayerUUID2 {
    uuid: string;
}

export function makeClientUUID(s: string): ClientUUID {
    return s as ClientUUID;
}

export function makePlayerUUID(s: string): PlayerUUID {
    return s as PlayerUUID;
}

export function makeGameInstanceUUID(s: string): GameInstanceUUID {
    return s as GameInstanceUUID;
}

export function makeUUID(s: string): UUID {
    return s as UUID;
}

export function makeBlankUUID(): UUID {
    return '' as UUID;
}