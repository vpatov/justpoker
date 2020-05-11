import React from 'react';
import { MAX_VALUES } from './shared/util/consts';

import purple from '@material-ui/core/colors/purple';
import pink from '@material-ui/core/colors/pink';
import grey from '@material-ui/core/colors/grey';
import green from '@material-ui/core/colors/green';
import lightGreen from '@material-ui/core/colors/lightGreen';
import cyan from '@material-ui/core/colors/cyan';
import lime from '@material-ui/core/colors/lime';
import yellow from '@material-ui/core/colors/yellow';
import deepOrange from '@material-ui/core/colors/deepOrange';
import red from '@material-ui/core/colors/red';
import deepPurple from '@material-ui/core/colors/deepPurple';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    svgCircle: {
        strokeWidth: '5%',
        r: '28%',
    },
    svgInnerCircle: {
        strokeWidth: '2.5%',
        r: '10%',
    },
}));

function Chip(props) {
    const classes = useStyles();
    const { yPos = '50%', xPos = '50%', amount } = props;

    function getChipHueFromAmount(amount) {
        if (MAX_VALUES.PLAYER_STACK < amount) {
            return grey;
        }
        const hues = [cyan, deepOrange, green, purple, lightGreen, pink, yellow, deepPurple, lime, red];
        const hueIndex = Math.floor(Math.log10(amount));
        return hues[hueIndex];
    }

    const hue = getChipHueFromAmount(amount);

    return (
        <g>
            <circle className={classes.svgCircle} stroke={hue[100]} fill={hue.A400} cy={yPos} cx={xPos} />
            <circle
                className={classes.svgCircle}
                fill={'none'}
                stroke={hue[700]}
                strokeDasharray="15%, 15%"
                cy={yPos}
                cx={xPos}
            />
            <circle className={classes.svgInnerCircle} stroke={'white'} cy={yPos} cx={xPos} />
            <circle
                className={classes.svgInnerCircle}
                stroke={'black'}
                fill={'white'}
                strokeDasharray="6%"
                cy={yPos}
                cx={xPos}
            />
        </g>
    );
}

export default Chip;
