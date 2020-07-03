import React, { useState, useEffect } from 'react';

import { playTimerWarning } from '../game/AudioModule';
import { animateTimeBankButton } from '../game/AnimiationModule';

import { Typography } from '@material-ui/core';

function getPercentTimeRemaining(timeElapsed: number, timeLimit: number): number {
    const timeElapsedPercentage = (timeElapsed * 100.0) / timeLimit;
    return 100.0 - timeElapsedPercentage;
}

const WARN_TIME = 8;
let timeBankAni: any = false;
function PlayerTimer(props) {
    const { playerTimer, hero, className } = props;
    const { timeLimit, timeElapsed } = playerTimer;

    const [completed, setCompleted] = useState(100.0);
    const [timer, setTimer] = useState();
    const [secondsRemaining, setSecondsRemaining] = useState(timeLimit - timeElapsed);
    const [playedWarning, setPlayedWarning] = useState(false);

    useEffect(() => {
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

    useEffect(() => {
        return () => {
            console.log(timeBankAni);
            if (timeBankAni) {
                timeBankAni.reset();
                timeBankAni = false;
            }
        };
    }, []);

    if (completed < 1) {
        clearInterval(timer);
    }

    if (hero && !playedWarning && secondsRemaining < WARN_TIME) {
        setPlayedWarning(true);
        playTimerWarning();
        timeBankAni = animateTimeBankButton();
    }

    return <Typography className={className}>{Math.floor(secondsRemaining)}</Typography>;
}

export default PlayerTimer;
