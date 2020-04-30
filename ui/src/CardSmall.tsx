import React from "react";

import { generateStringFromSuit, SUITS } from "./utils";
import classnames from "classnames";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
    root: {
        zIndex: -1,
        borderRadius: 6,
        textAlign: "center",
        position: "relative",
        backgroundColor: "white",
        height: "8.8vmin",
        width: "6.8vmin",
        display: "flex",
        justifyContent: "space-evenly",
        margin: "0 0.5vmin",
    },
    text: {
        letterSpacing: "-0.3vmin",
        fontSize: "3vmin",
        color: "white",
        fontWeight: "bold",
        marginTop: "18%",
    },
    hidden: {
        margin: "0 0.5vmin",
        borderRadius: 6,
        textAlign: "center",
        position: "relative",
        backgroundColor: "white",
        height: "6.8vmin",
        width: "5.5vmin",
        display: "flex",
        justifyContent: "center",
        fontSize: "3vmin",
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
