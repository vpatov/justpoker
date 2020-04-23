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
        display: "flex",
        justifyContent: "space-evenly",
    },
    valueTextsmall: {
        letterSpacing: "-0.05vmin",
        fontSize: "2.1vmin",
        color: "white",
        fontWeight: "bold",
        marginTop: '0.5vmin',
    },
    valueTextlarge: {
        fontWeight: "bold",
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
        fontSize: "4vmin",
        position: "absolute",
        bottom: "-0.6vmin",
        right: "0.8vmin",
        color: "white",
        display: "inline-block",
    },
    hidden: {
        display: "flex",
        justifyContent: "center",
        fontSize: "2.8vmin",
        fontWeight: "bold",
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
            >JP</div>
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
