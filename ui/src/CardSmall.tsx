import React from "react";

import { generateStringFromSuit, SUITS } from "./utils";
import classnames from "classnames";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
    root: {
        borderRadius: 6,
        textAlign: "center",
        position: "relative",
        backgroundColor: "white",
        height: "6vmin",
        width: "5vmin",
        display: "flex",
        justifyContent: "space-evenly",
    },
    text: {
        letterSpacing: "-0.05vmin",
        fontSize: "2.1vmin",
        color: "white",
        fontWeight: "bold",
        marginTop: "0.5vmin",
    },
    hidden: {
        display: "flex",
        justifyContent: "center",
        fontSize: "2.8vmin",
        fontWeight: "bold",
        ...theme.custom.HIDDEN,
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

function CardSmall(props) {
    const classes = useStyles();
    const { suit, rank, hidden, className } = props;

    if (hidden) {
        return (
            <Typography
                className={classnames(classes.root, classes.hidden, className)}
            >
                JP
            </Typography>
        );
    }
    return (
        <div className={classnames(classes.root, classes[suit], className)}>
            <Typography className={classnames(classes.text)}>
                {`${rank} ${generateStringFromSuit(suit)}`}
            </Typography>
        </div>
    );
}

export default CardSmall;
