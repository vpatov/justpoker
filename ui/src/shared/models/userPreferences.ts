export declare interface UserPreferences {
    theme: ThemePreferences;
}

export declare interface ThemePreferences {
    twoColor: boolean;
    background: Background;
}

export enum Background {
    BLUE = 'linear-gradient(360deg, rgba(50,50,63) 0%, rgb(25,25,40))',
    GREEN = 'linear-gradient(360deg, rgba(50,63,50) 0%, rgb(25,40,25))',
    RED = 'linear-gradient(360deg, rgba(63,50,50) 0%, rgb(40,25,25))',
}

export const DEFAULT_PREFERENCES: UserPreferences = {
    theme: {
        twoColor: false,
        background: Background.RED,
    },
};
