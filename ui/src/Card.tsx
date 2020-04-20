import React, { Fragment } from "react";

import { generateStringFromSuit, SUITS } from "./utils";
import classnames from "classnames";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
    root: {
        borderRadius: 6,
        display: "inline-block",
        textAlign: "center",
        position: "relative",
        backgroundColor: "white",
        boxShadow: "0 0 0.3vmin 0.1vmin rgba(255,255,255,0.5)",
    },
    large: {
        height: "10vmin",
        width: "8vmin",
        fontSize: "5vmin",
        margin: "0.5vmin",
    },
    small: {
        height: "6vmin",
        width: "5vmin",
        margin: "0.4vmin",
        display: "flex",
        justifyContent: "space-evenly",
    },
    valueTextsmall: {
        letterSpacing: "-0.3vmin",
        fontSize: "2.5vmin",
        color: "white",
        fontWeight: "bold",
        fontFamily: "Futura, Roboto, Avenir, Helvetica, Arial, sans-serif",
    },
    valueTextlarge: {
        fontWeight: "bold",
        fontFamily: "Futura, Roboto, Avenir, Helvetica, Arial, sans-serif",
    },
    rankTextlarge: {
        fontSize: "inherit",
        position: "absolute",
        top: "-1vmin",
        left: "0.8vmin",
        color: "white",
        display: "inline-block",
    },
    suitTextlarge: {
        fontSize: "inherit",
        position: "absolute",
        bottom: "-0.6vmin",
        right: "0.8vmin",
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

    function generateSmallText() {
        return (
            <Typography className={classnames(classes[`valueText${size}`])}>
                {`${rank} ${generateStringFromSuit(suit)}`}
            </Typography>
        );
    }

    function generateLargeText() {
        return (
            <Fragment>
                <Typography
                    className={classnames(
                        classes[`valueText${size}`],
                        classes[`rankText${size}`]
                    )}
                >
                    {rank}
                </Typography>
                <Typography
                    className={classnames(
                        classes[`valueText${size}`],
                        classes[`suitText${size}`]
                    )}
                >
                    {generateStringFromSuit(suit)}
                </Typography>
            </Fragment>
        );
    }
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
            {size === "small" ? generateSmallText() : generateLargeText()}
        </div>
    );
}

export default Card;
