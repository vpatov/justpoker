import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { heroPlayerTimerSelector, heroPlayerToAct } from '../store/selectors';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const updateIntervalS = 0.4;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            opacity: 1,
            transition: `transform ${updateIntervalS}s 10ms linear`,
            boxShadow: `0px 5px 0.4vmin 1.3vmin ${theme.palette.primary.main}`,
            animation: '1s ease-in-out 0s 1 $fadeIn;',
        },
        '@keyframes fadeIn': {
            '0%': {
                opacity: 0,
            },
            '100%': {
                opacity: 1,
            },
        },
    }),
);

function ControllerTimer(props) {
    const classes = useStyles();
    const { className } = props;

    const playerTimer = useSelector(heroPlayerTimerSelector);

    const timeElapsed = Math.ceil(playerTimer.timeElapsed);
    const timeLimit = playerTimer.timeLimit;
    const beginBelowSeconds = 10;

    const [rTimer, setRTimer] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(timeLimit - timeElapsed);

    function computeCompleted() {
        let startCompleted = 0;
        if (timeRemaining < beginBelowSeconds) {
            startCompleted = ((beginBelowSeconds - timeRemaining) * 100) / beginBelowSeconds;
        }
        return startCompleted;
    }

    function progress() {
        setTimeRemaining((old) => old - updateIntervalS);
    }

    if (!rTimer) {
        const timer = setInterval(progress, updateIntervalS * 1000);
        setRTimer(timer as any);
    }

    useEffect(() => {
        setTimeRemaining(timeLimit - timeElapsed);
    }, [timeLimit, timeElapsed]);

    // clean up
    useEffect(() => {
        return () => clearInterval(rTimer);
    }, []);

    if (timeRemaining < 0) {
        clearInterval(rTimer);
    }

    const completed = computeCompleted();

    return (
        <div
            className={classnames(classes.root)}
            style={{
                transform: `translateX(-${completed}%)`,
            }}
        ></div>
    );
}

function ControllerTimerWrapper() {
    const toAct = useSelector(heroPlayerToAct);
    if (!toAct) return null;

    return <ControllerTimer />;
}
export default ControllerTimerWrapper;
