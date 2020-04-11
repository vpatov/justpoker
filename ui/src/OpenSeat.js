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
    width: "8vmin",
    height: "8vmin",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: `2px solid ${grey[500]}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    backgroundColor: grey[400],
    cursor: "pointer",
    "&:hover": {
      borderColor: "black",
      backgroundColor: grey[200],
    },
  },
  text: {
    fontSize: "1.3vmin",
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
        buyin: 54100,
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
        Sit
      </Typography>
    </Button>
  );
}

export default OpenSeat;
