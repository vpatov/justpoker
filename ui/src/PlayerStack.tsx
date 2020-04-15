import React, { useEffect } from "react";
import CountUp from "react-countup";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ButtonSvg from "./imgs/button.svg";

import PlayerTimer from "./PlayerTimer";

const useStyles = makeStyles((theme) => ({
    root: {
        zIndex: 2,
    },
    stackCont: {
        marginTop: -12,
        padding: "0.8vmin",
        width: "100%",
        borderRadius: "0.6vmin",
        fontSize: "18px",
        position: "relative",
        ...theme.custom.STACK,
    },
    playerTimer: {
        position: "absolute",
        width: "100%",
        bottom: 0,
        left: 0,
    },
    name: {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        fontSize: "1.3vmin",
    },
    stack: {
        fontWeight: "bold",
        fontSize: "1.7vmin",
    },
    buttonR: {
        height: "2vmin",
        float: "right",
    },
    act: {
        backgroundColor: "rgba(0, 236, 255, 1)",
    },

    winner: {
        "&:before": {
            zIndex: -1,
            position: "absolute",
            // top: "-25%",
            content: '""',
            width: "100%",
            height: "100%",
            border: "1-px dotted rgba(5,255,5,1)",
            borderRadius: "50%",
            boxShadow: `0px 0px 10px 20px rgba(5,255,5,1)`,
            backgroundColor: `rgba(5,255,5,1)`,
            "-webkit-animation": "$scale 1s infinite ease-in-out",
            animation: "$scale 1s infinite ease-in-out",
        },
    },
    toAct: {
        "&:before": {
            zIndex: -1,
            position: "absolute",
            content: '""',
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            boxShadow: `0px 0px 16px 16px rgba(0,236,255,1)`,
            backgroundColor: `rgba(0,236,255,1)`,
            "-webkit-animation": "$beacon 1.6s infinite linear",
            animation: "$beacon 1.6s infinite linear",
        },
    },
    "@keyframes scale": {
        "0%": {
            transform: "scale(1)",
        },
        "50%": {
            transform: "scale(1.03)",
        },
        "100%": {
            transform: "scale(1)",
        },
    },
    "@keyframes beacon": {
        "0%": {
            transform: "scale(.1)",
            opacity: 1,
        },
        "70%": {
            transform: "scale(2)",
            opacity: 0,
        },
        "100%": {
            opacity: 0,
        },
    },
}));

function PlayerStack(props) {
    const classes = useStyles();
    const { stack, name, button, timeLimit } = props;

    useEffect(() => {
        console.log("stack changed");
    }, [stack]);

    return (
        <div className={classes.stackCont}>
            {button ? (
                <img src={ButtonSvg} className={classes.buttonR} />
            ) : null}
            <Typography variant="h4" className={classes.stack}>
                {stack.toLocaleString()}
                {/* <CountUp start={0} end={stack} separator="," /> */}
            </Typography>
            <Typography variant="body1" className={classes.name}>
                {name}
            </Typography>
            {timeLimit ? (
                <PlayerTimer
                    className={classes.playerTimer}
                    timeLimit={timeLimit}
                />
            ) : null}
        </div>
    );
}

export default PlayerStack;
