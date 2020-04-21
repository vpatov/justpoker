import React, { useState } from "react";
import classnames from "classnames";
import Hand from "./Hand";
import { WsServer } from "./api/ws";
import { ActionType } from "./shared/models/wsaction";

import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import EventSeatIcon from "@material-ui/icons/EventSeat";
import grey from "@material-ui/core/colors/grey";
import Typography from "@material-ui/core/Typography";
import { ClientWsMessageRequest } from "./shared/models/wsaction";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "7vmin",
        height: "7vmin",
        border: `2px solid white`,
        backgroundColor: grey[800],
        color: "white",
        "&:hover": {
            backgroundColor: grey[900],
            borderColor: "black",
        },
    },
    icon: {
        fontSize: "3.4vmin",
    },
}));

function OpenSeat(props) {
    const classes = useStyles();
    const { className, style, seatNumber } = props;

    // TODO change this to onRequestSitDown, because the player has to request to sit down,
    // declare their name, chips, waitForBigBlind?, etc...
    function onSitDown() {
        WsServer.send({
            actionType: ActionType.JOINTABLEANDSITDOWN,
            request: {
                name: `Player${seatNumber}`,
                buyin: 200,
                seatNumber: seatNumber,
            } as ClientWsMessageRequest,
        });
    }

    return (
        <IconButton
            color="primary"
            className={classnames(classes.root, className)}
            style={style}
            onClick={() => onSitDown()}
        >
            <EventSeatIcon className={classes.icon} />
        </IconButton>
    );
}

export default OpenSeat;
