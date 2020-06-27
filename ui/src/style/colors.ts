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

export const Background = {
    blue: blue[600],
    purple: deepPurple[600],
    brown: brown[400],
    yellow: yellow[700],
    grey: grey[500],
    indigo: indigo[800],
    red: red[700],
    green: green[700],
    orange: orange[600],
};

export const PlayerColors: { [color: string]: string } = {
    blue: blue[500],
    purple: deepPurple[400],
    teal: teal[300],
    yellow: yellow[300],
    indigo: indigo[400],
    red: red[400],
    green: green[400],
    orange: orange[300],
    pink: pink[300],
    brown: brown[400],
    lime: lime[400],
};

const playerColorKeys = Object.keys(PlayerColors);

export function getPlayerNameColor(seatNumber: number) {
    if (seatNumber >= 0 || seatNumber < playerColorKeys.length) {
        return PlayerColors[playerColorKeys[seatNumber]];
    } else return grey[400];
}
