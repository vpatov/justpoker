import React, { useState } from "react";
import classnames from "classnames";
import Hand from "./Hand";
import { server } from "./api/ws";

import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import EventSeatIcon from "@material-ui/icons/EventSeat";
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
    <IconButton
      className={classnames(classes.root, className)}
      style={style}
      onClick={() => onSitDown()}
    >
      <EventSeatIcon className={classes.icon} />
    </IconButton>
  );
}

export default OpenSeat;
