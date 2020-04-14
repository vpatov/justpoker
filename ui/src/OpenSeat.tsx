import React, { useState } from "react";
import classnames from "classnames";
import Hand from "./Hand";
import { server } from "./api/ws";

import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import yellow from "@material-ui/core/colors/yellow";
import grey from "@material-ui/core/colors/grey";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "7vmin",
        height: "7vmin",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: `2px solid ${grey[500]}`,
        justifyContent: "center",
        borderRadius: "50%",
        backgroundColor: "rgba(50,50,50,0.5)",
        cursor: "pointer",
        color: "white",
        "&:hover": {
            borderColor: "black",
        },
    },
    text: {
        fontSize: "3.4vmin",
        textTransform: "none",
    },
}));

function OpenSeat(props) {
    const classes = useStyles();
    const { className, style, seatNumber } = props;

    // TODO change this to onRequestSitDown, because the player has to request to sit down,
    // declare their name, chips, waitForBigBlind?, etc...
    function onSitDown() {
        server.send({
            actionType: "JOINTABLEANDSITDOWN",
            joinTableAndSitDownRequest: {
                name: `Player${seatNumber}`,
                buyin: 200,
                seatNumber: seatNumber,
            },
        });
    }

    return (
        <Button
            variant="contained"
            className={classnames(classes.root, className)}
            style={style}
            onClick={() => onSitDown()}
        >
            <Typography className={classes.text} variant="body2">
                +
      </Typography>
        </Button>
    );
}

export default OpenSeat;
