import React, { useState } from "react";
import classnames from "classnames";
import Hand from "./Hand";
import PlayerStack from "./PlayerStack";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import deepOrange from "@material-ui/core/colors/deepOrange";
import PlayerTimer from "./PlayerTimer";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "15vmin",
        height: "11vmin",
        transition: "transform 0.3s linear 0s",
        alignItems: "flex-end",
        display: 'flex',
        flexWrap: 'wrap',
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
                // [classes.winner]: winner,
                [classes.folded]: folded,
            })}
            style={style}
        >
            <Hand hand={hand} />
            <PlayerStack
                toAct={toAct}
                name={name}
                stack={stack}
                button={button}
                playerTimer={playerTimer}
                winner={winner}
            />
            {playerTimer ? (
                <PlayerTimer
                    playerTimer={playerTimer}
                />
            ) : null}
            {/* {handLabel ? (
                <Typography className={classes.handLabel}>
                    {handLabel}
                </Typography>
            ) : null} */}
        </div>
    );
}

export default Player;
