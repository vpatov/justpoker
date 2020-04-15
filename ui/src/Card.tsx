import React from "react";

import { generateStringFromSuit, SUITS } from "./utils";
import classnames from "classnames";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
    root: {
        border: "2px solid white",
        borderRadius: 6,
        display: "inline-block",
        textAlign: "center",
        position: "relative",
    },
    large: {
        height: "8vmin",
        width: "6vmin",
        fontSize: "4vmin",
        margin: 4,
    },
    small: {
        zIndex: -1,
        height: "6vmin",
        width: "5vmin",
        fontSize: "2.8vmin",
        margin: 2,
    },
    rankText: {
        fontSize: "inherit",
        position: "absolute",
        top: "-0.6vmin",
        left: "0.6vmin",
        color: "white",
        display: "inline-block",
    },
    suitText: {
        fontSize: "inherit",
        position: "absolute",
        bottom: "-0.6vmin",
        right: "0.6vmin",
        color: "white",
        display: "inline-block",
    },
    hidden: {
        ...theme.custom.HIDDEN,
    },
    side: {
        position: "relative",
        overflowWrap: "break-word",
        width: "60%",
    },
    [SUITS.HEARTS]: {
        ...theme.custom.HEARTS,
    },
    [SUITS.SPADES]: {
        ...theme.custom.SPADES,
    },
    [SUITS.CLUBS]: {
        ...theme.custom.CLUBS,
    },
    [SUITS.DIAMONDS]: {
        ...theme.custom.DIAMONDS,
    },
}));

function Card(props) {
    const classes = useStyles();
    const { suit, rank, size, style, hidden, className } = props;

    if (hidden) {
        return (
            <div
                className={classnames(
                    classes.root,
                    classes.hidden,
                    classes[size],
                    className
                )}
                style={style}
            />
        );
    }
    return (
        <div
            className={classnames(
                classes.root,
                classes[suit],
                className,
                classes[size]
            )}
            style={style}
        >
            <Typography
                className={classnames(classes.valueText, classes.rankText)}
                style={size === "small" ? { top: -2 } : {}}
            >
                {rank}
            </Typography>
            <Typography
                className={classnames(classes.valueText, classes.suitText)}
                style={size === "small" ? { top: -2 } : {}}
            >
                {generateStringFromSuit(suit)}
            </Typography>
        </div>
    );
}

export default Card;
