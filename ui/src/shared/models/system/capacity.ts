export declare interface Capacity {
    maxActiveWs: number;
}

export function getDefaultCapacity(): Capacity {
    return {
        maxActiveWs: 2000,
    };
}
