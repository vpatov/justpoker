import React, { useEffect, useRef } from "react";
import CountUp from "react-countup";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import classnames from "classnames";

import PlayerTimer from "./PlayerTimer";

const useStyles = makeStyles((theme) => ({
    root: {},
    stackCont: {
        width: "100%",
        fontSize: "18px",
        marginTop: "-2vmin",
        zIndex: 2,
        ...theme.custom.STACK,
    },
    toAct: {
        ...theme.custom.STACK,
        boxShadow: "0 0px 14px rgba(255,255,255,0.8)",
        background: "linear-gradient(90deg, rgba(100,100,115,1) 0%, rgba(80,80,135,1) 50%, rgba(100,100,115,1)  100%);",
        backgroundSize: "200% 200%",
        "-webkit-animation": "$grad 2s linear infinite",
        animation: "$grad 2s linear infinite",
        "-moz-animation": "$grad 2s linear infinite",

    },
    winner: {
        ...theme.custom.STACK,
        color: "black",
        backgroundColor: "white",
        boxShadow: "0 0px 10px rgba(255,255,255,0.8)",
        background: "linear-gradient(90deg, rgba(0,255,255,0.4) 0%, rgba(255,0,255,0.4) 50%, rgba(0,255,255,0.4) 100%);",
        backgroundSize: "200% 200%",
        "-webkit-animation": "$grad 2s linear infinite",
        animation: "$grad 2s linear infinite",
        "-moz-animation": "$grad 2s linear infinite",
    },
    "@keyframes grad": {
        "0%": {
            backgroundPosition: "0% 0%",
        },
        "100%": {
            backgroundPosition: "200% -200%",

        },
    },
    playerTimer: {
        position: "absolute",
        width: "100%",
        bottom: 0,
        left: 0,
    },
    name: {
        paddingBottom: "0.8vmin",
        paddingLeft: "0.6vmin",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        fontSize: "1.3vmin",
    },
    stack: {
        paddingTop: "0.8vmin",
        paddingLeft: "0.6vmin",
        fontWeight: "bold",
        fontSize: "1.7vmin",
    },
    buttonR: {
        fontWeight: "bold",
        fontSize: "1.7vmin",
        paddingTop: "0.3vmin",
        float: "right",
        height: "2vmin",
        width: "2vmin",

    },
    act: {
        backgroundColor: "rgba(0, 236, 255, 1)",
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
    const { stack, name, button, winner, playerTimer, toAct } = props;
    const prevStack = usePrevious(stack);

    return (
        <div className={classnames(classes.stackCont, { [classes.toAct]: toAct, [classes.winner]: winner, })}>
            {button ? (
                <Typography className={classes.buttonR} >
                    {"★"}
                </Typography>
            ) : null}
            <Typography variant="h4" className={classes.stack}>
                {winner ? (
                    <CountUp start={prevStack} end={stack} separator="," />
                ) : (
                        stack.toLocaleString()
                    )}
            </Typography>
            <Typography variant="body1" className={classes.name}>
                {name}
            </Typography>
            {playerTimer ? (
                <PlayerTimer
                    className={classes.playerTimer}
                    playerTimer={playerTimer}
                />
            ) : null}
        </div>
    );
}

export default PlayerStack;
