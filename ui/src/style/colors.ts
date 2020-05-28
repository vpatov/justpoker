import green from '@material-ui/core/colors/green';
import grey from '@material-ui/core/colors/grey';
import blue from '@material-ui/core/colors/blue';
import teal from '@material-ui/core/colors/teal';
import yellow from '@material-ui/core/colors/yellow';
import indigo from '@material-ui/core/colors/indigo';
import orange from '@material-ui/core/colors/orange';
import pink from '@material-ui/core/colors/pink';
import red from '@material-ui/core/colors/red';
import deepPurple from '@material-ui/core/colors/deepPurple';
import { brown, lime } from '@material-ui/core/colors';
import Color from 'color';


function computeColor(color: string) {
    return color.toString();
}

function computeBackgroundGradient(color: string) {
    const c = Color(color);
    const light = c.darken(0).desaturate(0.1);
    const dark = c.darken(0.3).desaturate(0.6);
    return `linear-gradient(360deg, ${dark.string()} 0%, ${light.string()})`;
}

export const Background = {
    blue: computeBackgroundGradient(blue[600]),
    purple: computeBackgroundGradient(deepPurple[600]),
    teal: computeBackgroundGradient(teal[500]),
    yellow: computeBackgroundGradient(yellow[600]),
    grey: computeBackgroundGradient(grey[700]),
    indigo: computeBackgroundGradient(indigo[800]),
    red: computeBackgroundGradient(red[700]),
    green: computeBackgroundGradient(green[700]),
    orange: computeBackgroundGradient(orange[600]),
};

export const PlayerColors: { [color: string]: string } = {
    blue: computeColor(blue[500]),
    purple: computeColor(deepPurple[400]),
    teal: computeColor(teal[300]),
    yellow: computeColor(yellow[300]),
    indigo: computeColor(indigo[400]),
    red: computeColor(red[400]),
    green: computeColor(green[400]),
    orange: computeColor(orange[300]),
    pink: computeColor(pink[300]),
    brown: computeColor(brown[400]),
    lime: computeColor(lime[400]),
};

const playerColorKeys = Object.keys(PlayerColors);
export function getPlayerNameColor(seatNumber: number) {
    if (seatNumber >= 0 || seatNumber < playerColorKeys.length) {
        return PlayerColors[playerColorKeys[seatNumber]];
    } else return computeColor(grey[400]);
}