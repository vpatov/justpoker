import React from 'react';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { heroPlayerToAct } from '../store/selectors';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Color from 'color';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'absolute',
            width: '100%',
            height: '85%',
            opacity: 0,
            transition: 'opacity 0.25s linear',
        },
        rootToAct: {
            opacity: 1,
            background: getColor(theme.custom.BACKGROUND.backgroundColor),
            transition: 'opacity 0.25s linear',
        },
    }),
);

function getColor(bg) {
    const backgroundColor = Color(bg);

    const hslBg = backgroundColor.hsl().array();
    const hslShift = [30, 25, 30];
    const hslMax = [360, 100, 100];

    const newColor = Color.hsl(
        hslBg.map((cur, i) => (cur + hslShift[i] >= hslMax[i] ? cur - hslShift[i] : cur + hslShift[i])),
    );
    return `radial-gradient(${newColor} 0%,  ${backgroundColor} 85%)`;
}

function GameToActIndicator(props) {
    const classes = useStyles();
    const toAct = useSelector(heroPlayerToAct);
    return <div className={classnames(classes.root, { [classes.rootToAct]: toAct })} />;
}

export default GameToActIndicator;
