import React, { useState, useEffect } from "react";

import LinearProgress from "@material-ui/core/LinearProgress";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        linearTimer: {
            width: '100%',


        },
        linearTimerRoot: {
            borderBottomLeftRadius: "0.6vmin",
            borderBottomRightRadius: "0.6vmin",

            height: '0.5vmin',
        },
    })
);
function PlayerTimer(props) {
    const classes = useStyles();
    const { timeLimit, className } = props;

    const [completed, setCompleted] = useState(100);
    const [timer, setTimer] = useState();


    useEffect(() => {
        const updateIntervalMs = 250
        const reduceBy = (100.0 / timeLimit) * (updateIntervalMs / 1000)
        function progress() {
            setCompleted((oldCompleted) => oldCompleted - reduceBy)
        }
        const timer = setInterval(progress, updateIntervalMs);
        setTimer(timer as any)
        return () => {
            clearInterval(timer);
        };
    }, []);


    if (completed <= 0) {
        clearInterval(timer);
    }


    return (<div className={className} >
        <LinearProgress color='secondary' variant="determinate" value={completed} className={classes.linearTimer} classes={{
            root: classes.linearTimerRoot
        }} />
    </div>)
}

export default PlayerTimer;
