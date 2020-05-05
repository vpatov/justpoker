import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { heroPlayerTimerSelector, heroPlayerToAct } from './store/selectors';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import { readFile } from 'fs';

const updateIntervalS = 0.4;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            opacity: 1,
            transition: `transform ${updateIntervalS}s linear`,
            boxShadow: `0px 5px 2vmin 1vmin ${theme.palette.primary.main}`,
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

    const timer = useSelector(heroPlayerTimerSelector);

    const timeElapsed = Math.ceil(timer.timeElapsed);
    const timeLimit = timer.timeLimit;
    const beginBelowSeconds = 10;

    let startCompleted = 0;
    if (timeLimit - timeElapsed < beginBelowSeconds) {
        startCompleted = ((beginBelowSeconds - timeLimit + timeElapsed) * 100) / beginBelowSeconds;
    }
    console.log(timeLimit - timeElapsed, startCompleted);

    const [completed, setCompleted] = useState(startCompleted);
    const [timeRemaining, setTimeRemaining] = useState(timeLimit - timeElapsed);

    const [rTimer, setRTimer] = useState(0);

    function progress() {
        setTimeRemaining((old) => {
            if (Math.floor(old) <= beginBelowSeconds) {
                setCompleted((old) => old + (updateIntervalS * 100) / beginBelowSeconds);
            }
            return old - updateIntervalS;
        });
    }

    if (!rTimer) {
        const timer = setInterval(progress, updateIntervalS * 1000);
        setRTimer(timer as any);
    }

    // clean up
    useEffect(() => {
        return () => clearInterval(rTimer);
    }, []);

    if (timeRemaining < 0) {
        clearInterval(rTimer);
    }

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
