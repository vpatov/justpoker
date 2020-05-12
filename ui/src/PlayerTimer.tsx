import React, { useState, useEffect } from 'react';

import { playTimerWarning } from './AudioModule';
import classnames from 'classnames';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            zIndex: -1,
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderBottomLeftRadius: '0.6vmin',
            borderBottomRightRadius: '0.6vmin',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            margin: '0 auto',
            width: '40%',
            transform: 'translateX(-50%)',
            transition: 'transform 0.3s ease-in-out',
        },
        show: {
            transform: 'translateY(100%) translateX(-50%)',
        },
        secondsRemaining: {
            color: 'black',
            width: '3vmin',
            marginBottom: '0.3vmin',
            fontSize: '1.4vmin',
            textAlign: 'center',
        },
    }),
);

function getPercentTimeRemaining(timeElapsed: number, timeLimit: number): number {
    const timeElapsedPercentage = (timeElapsed * 100.0) / timeLimit;
    return 100.0 - timeElapsedPercentage;
}

function PlayerTimer(props) {
    const classes = useStyles();
    const { playerTimer, hero, className } = props;
    const { timeLimit, timeElapsed } = playerTimer;

    const [completed, setCompleted] = useState(100.0);
    const [timer, setTimer] = useState();
    const [secondsRemaining, setSecondsRemaining] = useState(timeLimit - timeElapsed);
    const [show, setShow] = useState(false);
    const [playedWarning, setPlayedWarning] = useState(false);

    useEffect(() => {
        setShow(true);
        setCompleted(getPercentTimeRemaining(timeElapsed, timeLimit));
        const updateIntervalMs = 1000;
        const reduceBy = (100.0 / timeLimit) * (updateIntervalMs / 1000);
        setSecondsRemaining(timeLimit - timeElapsed);
        function progress() {
            setCompleted((oldCompleted) => oldCompleted - reduceBy);
            setSecondsRemaining((oldSR) => Math.max(oldSR - updateIntervalMs / 1000, 0));
        }
        const timer = setInterval(progress, updateIntervalMs);
        setTimer(timer as any);
        return () => {
            clearInterval(timer);
        };
    }, [timeElapsed, timeLimit]);

    if (completed < 1) {
        clearInterval(timer);
    }

    if (hero && !playedWarning && secondsRemaining < 6) {
        setPlayedWarning(true);
        playTimerWarning();
    }

    return (
        <div
            className={classnames(classes.root, className, {
                [classes.show]: show,
            })}
        >
            <Typography className={classes.secondsRemaining}>{Math.floor(secondsRemaining)}</Typography>
            {/* <LinearProgress
                color="primary"
                variant="determinate"
                value={completed}
                className={classes.linearTimer}
                classes={{
                    root: classes.linearTimerRoot,
                }}
            /> */}
        </div>
    );
}

export default PlayerTimer;
