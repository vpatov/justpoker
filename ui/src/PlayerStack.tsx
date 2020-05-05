import React, { useEffect, useRef } from 'react';
import CountUp from 'react-countup';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import classnames from 'classnames';

const useStyles = makeStyles((theme) => ({
    stackCont: {
        width: '100%',
        marginTop: '-1vmin',

        ...theme.custom.STACK,
    },
    toAct: {
        ...theme.custom.STACK_TO_ACT,
    },
    winner: {
        ...theme.custom.STACK_WINNER,
    },
    '@keyframes grad': {
        '0%': {
            backgroundPosition: '0% 0%',
        },
        '100%': {
            backgroundPosition: '200% -200%',
        },
    },
    name: {
        paddingBottom: '0.8vmin',
        paddingLeft: '0.6vmin',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        fontSize: '1.3vmin',
    },
    stack: {
        paddingTop: '0.8vmin',
        paddingLeft: '0.6vmin',
        fontWeight: 'bold',
        fontSize: '1.7vmin',
    },
    buttonR: {
        fontWeight: 'bold',
        fontSize: '1.7vmin',
        paddingTop: '0.3vmin',
        paddingRight: '0.3vmin',
        float: 'right',
        height: '2vmin',
        width: '2vmin',
    },
    act: {
        backgroundColor: 'rgba(0, 236, 255, 1)',
    },
}));

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

function PlayerStack(props) {
    const classes = useStyles();
    const { stack, name, button, winner, toAct } = props;
    const prevStack = usePrevious(stack);

    return (
        <div
            className={classnames(classes.stackCont, {
                [classes.toAct]: toAct,
                [classes.winner]: winner,
            })}
        >
            {button ? <Typography className={classes.buttonR}>{'★'}</Typography> : null}
            <Typography variant="h4" className={classes.stack}>
                {winner ? <CountUp start={prevStack} end={stack} separator="," /> : stack.toLocaleString()}
            </Typography>
            <Typography variant="body1" className={classes.name}>
                {name}
            </Typography>
        </div>
    );
}

export default PlayerStack;
