import React, { useState, useEffect } from "react";
import classnames from 'classnames'
import LinearProgress from "@material-ui/core/LinearProgress";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Collapse from '@material-ui/core/Collapse';
import transitions from "@material-ui/core/styles/transitions";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            zIndex: -1,
            display: "flex",
            alignItems: "center",
            height: "0.5vmin",
            padding: "0.8vmin 0.8vmin",
            backgroundColor: "rgba(255,255,255,0.3)",
            borderBottomLeftRadius: "0.6vmin",
            borderBottomRightRadius: "0.6vmin",
            position: "absolute",
            bottom: 0,
            left: "50%",
            margin: "0 auto",
            width: "80%",
            transform: "translateX(-50%)",
            transition: "transform 0.3s ease-in-out"
        },
        show: {
            transform: "translateY(100%) translateX(-50%)"
        },
        linearTimer: {
            width: "100%",
        },
        secondsRemaining: {
            width: "2.1vmin",
            fontSize: "1vmin"
        },
        linearTimerRoot: {
            flexShrink: 1,
            borderRadius: "0.6vmin",
            height: "0.5vmin",
        },
    })
);

function getPercetTimeRemaining(
    timeElapsed: number,
    timeLimit: number
): number {
    const timeElapsedPercentage = (timeElapsed * 100.0) / timeLimit;
    return 100.0 - timeElapsedPercentage;
}

function PlayerTimer(props) {
    const classes = useStyles();
    const { playerTimer, className } = props;
    const { timeLimit, timeElapsed } = playerTimer;

    const [completed, setCompleted] = useState(100.0);
    const [timer, setTimer] = useState();
    const [secondsRemaining, setSecondsRemaining] = useState(timeLimit - timeElapsed);
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true)
        setCompleted(getPercetTimeRemaining(timeElapsed, timeLimit));
        const updateIntervalMs = 1000;
        const reduceBy = (100.0 / timeLimit) * (updateIntervalMs / 1000);
        function progress() {
            setCompleted((oldCompleted) => oldCompleted - reduceBy);
            setSecondsRemaining((oldSR) => oldSR - updateIntervalMs / 1000);

        }
        const timer = setInterval(progress, updateIntervalMs);
        setTimer(timer as any);
        return () => {
            clearInterval(timer);
        };
    }, [timeElapsed, timeLimit]);

    if (completed <= 0) {
        clearInterval(timer);
    }

    return (
        <div className={classnames(classes.root, className, { [classes.show]: show })}>
            <Typography className={classes.secondsRemaining}>
                {Math.floor(secondsRemaining)}
            </Typography>
            <LinearProgress
                color="primary"
                variant="determinate"
                value={completed}
                className={classes.linearTimer}
                classes={{
                    root: classes.linearTimerRoot,
                }}
            />
        </div>

    );
}

export default PlayerTimer;
