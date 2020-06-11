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
    SERVER_PORT: string;
}

export const CONFIGS: Configs = {
    DEV: {
        SERVER_URL: '0.0.0.0',
        SERVER_PORT: '8080',
    },

    PROD: {
        SERVER_URL: 'justpoker.games',
        SERVER_PORT: '',
    },
};
