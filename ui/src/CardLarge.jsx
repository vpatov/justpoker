import React from "react";
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
        height: "10vmin",
        width: "8vmin",
        margin: "0.5vmin",
        overflow: "hidden",
    },
    text: {
        fontWeight: "bold",
    },
    rank: {
        fontSize: "5vmin",
        lineHeight: "1em",
        position: "absolute",
        top: "0.1vmin",
        left: "0.7vmin",
        color: "white",
    },
    suit: {
        fontSize: "5vmin",
        lineHeight: "5vmin",
        position: "absolute",
        bottom: "0.1vmin",
        right: "0.1vmin",
        color: "white",
        opacity: 0.7,
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

function CardLarge(props) {
    const classes = useStyles();
    const { suit, rank, className } = props;

    return (
        <div className={classnames(classes.root, classes[suit], className)}>
            <Typography className={classnames(classes.text, classes.rank)}>
                {rank}
            </Typography>
            <Typography className={classnames(classes.text, classes.suit)}>
                {generateStringFromSuit(suit)}
            </Typography>
        </div>
    );
}

export default CardLarge;
