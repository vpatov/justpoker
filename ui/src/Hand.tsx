import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CardSmall from "./CardSmall";

const useStyles = makeStyles((theme) => ({
    root: {
        margin: "0 auto",
        width: "100%",
        height: "50%",
        display: "flex",
        justifyContent: "space-evenly",
    },
}));

function Hand(props) {
    const classes = useStyles();
    const { cards } = props.hand;

    return (
        <div className={classes.root}>
            {cards.map((c) => (
                <CardSmall
                    suit={c.suit}
                    rank={c.rank}
                    hidden={c.hidden}
                    size="small"
                />
            ))}
        </div>
    );
}

export default Hand;
