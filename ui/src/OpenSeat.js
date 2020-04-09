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
    width: "9vmin",
    height: "9vmin",
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
      borderColor: grey[100],
      backgroundColor: grey[200],
    },
  },
}));



function OpenSeat(props) {
  const classes = useStyles();
  const { className, style, seatNumber } = props;

  // TODO change this to onRequestSitDown, because the player has to request to sit down,
  // declare their name, chips, waitForBigBlind?, etc...
  function onSitDown(){
    server.send({
      actionType: 'JOINTABLEANDSITDOWN',
      data: {
        name: "VasVas",
        buyin: 54100,
        seatNumber: seatNumber
      }
    });
  }

  return (
    <Button
      variant="contained"
      className={classnames(classes.root, className)}
      style={style}
      onClick={() => onSitDown()}
    >
       <Typography variant="body2">Sit Here</Typography>
    </Button>
  );
}

export default OpenSeat;
