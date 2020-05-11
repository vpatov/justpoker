import blueGrey from '@material-ui/core/colors/blueGrey';
import grey from '@material-ui/core/colors/grey';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import teal from '@material-ui/core/colors/teal';
import yellow from '@material-ui/core/colors/yellow';
import indigo from '@material-ui/core/colors/indigo';
import deepOrange from '@material-ui/core/colors/deepOrange';
import orange from '@material-ui/core/colors/orange';
import red from '@material-ui/core/colors/red';
import deepPurple from '@material-ui/core/colors/deepPurple';

var Color = require('color');

export declare interface UserPreferences {
    theme: ThemePreferences;
}

export declare interface ThemePreferences {
    twoColor: boolean;
    background: string;
}

function computeBackgroundGradient(color) {
    const c = Color(color);
    const light = c.darken(0.0).desaturate(0.3);
    const dark = c.darken(0.2).desaturate(0.5);
    return `linear-gradient(360deg, ${dark.string()} 0%, ${light.string()})`;
}

export const Background = {
    blue: computeBackgroundGradient(blue[600]),
    purple: computeBackgroundGradient(deepPurple[700]),
    teal: computeBackgroundGradient(teal[600]),
    yellow: computeBackgroundGradient(yellow[600]),
    grey: computeBackgroundGradient(grey[700]),
    indigo: computeBackgroundGradient(indigo[900]),
    red: computeBackgroundGradient(red[700]),
    green: computeBackgroundGradient(green[700]),
    orange: computeBackgroundGradient(orange[600]),
};

// BLUE: `radial-gradient(circle, rgba(30,30,42,1) 0%, rgba(10,10,10,1) 100%)`,

export const DEFAULT_PREFERENCES: UserPreferences = {
    theme: {
        twoColor: false,
        background: Background.blue,
    },
};
