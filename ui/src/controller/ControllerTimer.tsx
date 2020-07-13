import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { heroPlayerTimerSelector, heroPlayerToAct } from '../store/selectors';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const UPDATE_INTERVAL_SECS = 0.4;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            opacity: 1,
            // animate with transform as this is the most performant css property to animate
            // because does not force recomputaions of layout
            transition: `transform ${UPDATE_INTERVAL_SECS}s 10ms linear`,
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

const beginBelowSeconds = 10;

// timer appears above controllers it animates leftwards,
// like a reverse loading-bar to indicate to user the
// amount of time they have left in their turn
// should begin animation at beginBelowSeconds and end at 0s
function ControllerTimer() {
    const classes = useStyles();

    const playerTimer = useSelector(heroPlayerTimerSelector);

    const timeElapsed = Math.ceil(playerTimer.timeElapsed);
    const timeLimit = playerTimer.timeLimit;

    const [rTimer, setRTimer] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(timeLimit - timeElapsed);

    // computes the amount we should trasnform the timer by
    // such that it begains to animate below  beginBelowSeconds
    // and completes at 0
    function computePercentageTransform(): number {
        let startCompleted = 0;
        if (timeRemaining < beginBelowSeconds) {
            startCompleted = ((beginBelowSeconds - timeRemaining) * 100) / beginBelowSeconds;
        }
        return Math.round(startCompleted);
    }

    // tick the time remaining in setInterval
    function tick(): void {
        setTimeRemaining((old) => old - UPDATE_INTERVAL_SECS);
    }

    // if we receiver new timer from server
    // set the time remaining accordingly
    // expected to happen during time bank usage
    useEffect(() => {
        setTimeRemaining(timeLimit - timeElapsed);
    }, [timeLimit, timeElapsed]);

    // clean up timer on unmount
    useEffect(() => {
        return () => clearInterval(rTimer);
    }, [rTimer]);

    // if time expires clear the interval
    if (timeRemaining < 0) {
        clearInterval(rTimer);
    }

    // if there is not timer create one
    if (!rTimer) {
        const timer = setInterval(tick, UPDATE_INTERVAL_SECS * 1000);
        setRTimer(timer as any);
    }

    const transformBy = computePercentageTransform();
    return (
        <div
            className={classnames(classes.root)}
            style={
                transformBy !== 0
                    ? {
                          transform: `translateX(${transformBy * -1}%)`,
                      }
                    : {}
            }
        />
    );
}

function ControllerTimerWrapper() {
    const toAct = useSelector(heroPlayerToAct);
    if (!toAct) return null;

    return <ControllerTimer />;
}

ControllerTimer.displayName = 'ControllerTimer';
ControllerTimerWrapper.displayName = 'ControllerTimerWrapper';

export default ControllerTimerWrapper;
