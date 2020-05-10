import brown from '@material-ui/core/colors/brown';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import teal from '@material-ui/core/colors/teal';
import yellow from '@material-ui/core/colors/yellow';
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
    return `radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.3) 100%)`;
    const c = Color(shade[100]);
    const light = c.darken(0.62).desaturate(0.1);
    const dark = c.darken(0.83).desaturate(0.3);
    return `radial-gradient(circle, ${light.string()} 0%, ${dark.string()})`;
}

function computeBackgroundGradient(shade) {
    const c = Color(shade[100]);
    const light = c.darken(0.5).desaturate(0.3);
    const dark = c.darken(0.6).desaturate(0.4);
    return `linear-gradient(360deg, ${dark.string()} 0%, ${light.string()})`;
}

export const Background = {
    blue: computeBackgroundGradient(blue),
    purple: computeBackgroundGradient(deepPurple),
    teal: computeBackgroundGradient(teal),
    yellow: computeBackgroundGradient(yellow),
    brown: computeBackgroundGradient(brown),
    indigo: computeBackgroundGradient(indigo),
    red: computeBackgroundGradient(red),
    green: computeBackgroundGradient(green),
    orange: computeBackgroundGradient(deepOrange),
};

export const Table = {
    blue: computeBackgroundGradient(blue),
    purple: computeTableGradient(deepPurple),
    teal: computeBackgroundGradient(teal),
    yellow: computeBackgroundGradient(yellow),
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
