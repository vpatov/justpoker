import React, { useState } from "react";
import classnames from "classnames";
import Hand from "./Hand";
import PlayerStack from "./PlayerStack";
import PlayerTimer from "./PlayerTimer";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import deepOrange from "@material-ui/core/colors/deepOrange";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "9vw",
        height: "12vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "transform 0.3s linear 0s",
    },
    folded: {
        ...theme.custom.FOLDED,
    },
    handLabel: {
        zIndex: 1,
        backgroundColor: deepOrange[400],
        fontSize: "1.2vmin",
        padding: "1% 8%",
        borderTop: `none`,
        borderBottomLeftRadius: "0.6vmin",
        borderBottomRightRadius: "0.5vmin",
    },
    playerTimer: {
        width: "100%",
    },
    winner: {
        "&:before": {
            zIndex: -1,
            position: "absolute",
            content: '""',
            top: "-8%",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            boxShadow: `0px 0px 10px 20px rgba(200,200,235,0.8)`,
            backgroundColor: `rgba(200,200,235,0.8)`,
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
            boxShadow: `0px 0px 2px 10px rgba(0,236,255,1)`,
            backgroundColor: `rgba(0,236,255,0.7)`,
            "-webkit-animation": "$beacon 1.4s infinite linear",
            animation: "$beacon 1.4s infinite linear",
        },
    },
    "@keyframes scale": {
        "0%": {
            transform: "scale(1)",
        },
        "50%": {
            transform: "scale(1.1)",
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
            transform: "scale(1.6)",
            opacity: 0,
        },
        "100%": {
            opacity: 0,
        },
    },
}));

function Player(props) {
    const classes = useStyles();
    const { className, style } = props;
    const {
        stack,
        hand,
        name,
        toAct,
        playerTimer,
        winner,
        button,
        folded,
        handLabel,
    } = props.player;

    return (
        <div
            className={classnames(classes.root, className, {
                [classes.toAct]: toAct,
                [classes.winner]: winner,
                [classes.folded]: folded,
            })}
            style={style}
        >
            <Hand hand={hand} />
            <PlayerStack
                name={name}
                stack={stack}
                button={button}
                playerTimer={playerTimer}
                winner={winner}
            />
            {/* {timeLimit ? <PlayerTimer className={classes.playerTimer}  /> : null} */}
            {handLabel ? (
                <Typography className={classes.handLabel}>
                    {handLabel}
                </Typography>
            ) : null}
        </div>
    );
}

export default Player;
