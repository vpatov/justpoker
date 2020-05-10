import brown from '@material-ui/core/colors/brown';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import cyan from '@material-ui/core/colors/cyan';
import lightBlue from '@material-ui/core/colors/lightBlue';
import indigo from '@material-ui/core/colors/indigo';
import deepOrange from '@material-ui/core/colors/deepOrange';
import red from '@material-ui/core/colors/red';
import deepPurple from '@material-ui/core/colors/deepPurple';

var Color = require('color');

export declare interface UserPreferences {
    theme: ThemePreferences;
}

export declare interface ThemePreferences {
    twoColor: boolean;
    background: string;
    table: string;
}

function computeTableGradient(shade) {
    const c = Color(shade[100]);
    const light = c.darken(0.62).desaturate(0.1);
    const dark = c.darken(0.83).desaturate(0.3);
    return `radial-gradient(circle, ${light.string()} 0%, ${dark.string()})`;
}

function computeBackgroundGradient(shade) {
    const c = Color(shade[100]);
    const light = c.darken(0.65).desaturate(0.7);
    const dark = c.darken(0.75).desaturate(0.8);
    return `linear-gradient(360deg, ${dark.string()} 0%, ${light.string()})`;
}

export const Background = {
    blue: computeBackgroundGradient(blue),
    cyan: computeBackgroundGradient(cyan),
    purple: computeBackgroundGradient(deepPurple),
    'light Blue': computeBackgroundGradient(lightBlue),
    brown: computeBackgroundGradient(brown),
    indigo: computeBackgroundGradient(indigo),
    red: computeBackgroundGradient(red),
    green: computeBackgroundGradient(green),
    orange: computeBackgroundGradient(deepOrange),
};

export const Table = {
    blue: computeBackgroundGradient(blue),
    cyan: computeTableGradient(cyan),
    purple: computeTableGradient(deepPurple),
    'light Blue': computeTableGradient(lightBlue),
    brown: computeTableGradient(brown),
    indigo: computeTableGradient(indigo),
    red: computeTableGradient(red),
    green: computeTableGradient(green),
    orange: computeTableGradient(deepOrange),
};

// BLUE: `radial-gradient(circle, rgba(30,30,42,1) 0%, rgba(10,10,10,1) 100%)`,

export const DEFAULT_PREFERENCES: UserPreferences = {
    theme: {
        twoColor: false,
        background: Background.indigo,
        table: Table.indigo,
    },
};
