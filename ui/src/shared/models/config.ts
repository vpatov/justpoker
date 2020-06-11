export enum ENVIRONMENT {
    PROD = 'PROD',
    DEV = 'DEV',
}

export declare interface Configs {
    [ENVIRONMENT.DEV]: Config;
    [ENVIRONMENT.PROD]: Config;
}

export declare interface Config {
    SERVER_URL: string;
    SERVER_PORT: number;
    CLIENT_NEED_PORT: boolean;
}

export const CONFIGS: Configs = {
    DEV: {
        SERVER_URL: '0.0.0.0',
        SERVER_PORT: 8080,
        CLIENT_NEED_PORT: true,
    },

    PROD: {
        SERVER_URL: 'justpoker.games',
        SERVER_PORT: 8080,
        CLIENT_NEED_PORT: false,
    },
};
