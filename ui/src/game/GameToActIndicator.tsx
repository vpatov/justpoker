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
            height: '100%',
            opacity: 0,
            transition: 'opacity 0.25s linear',
        },
        rootToAct: {
            // opacity: 1,
            // background: `radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.25) 100%) `,
            // transition: 'opacity 0.25s linear',
        },
    }),
);

function GameToActIndicator(props) {
    const classes = useStyles();
    const {} = props;
    const toAct = useSelector(heroPlayerToAct);
    return <div className={classnames(classes.root, { [classes.rootToAct]: toAct })} />;
}

export default GameToActIndicator;
