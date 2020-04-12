import React, { useState } from "react";
import classnames from "classnames";
import { server } from "./api/ws";

import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "20%",
    height: "100%",
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 2,
    ...theme.CONTROLLER,
  },
  sizeAndBetActionsCont: {
    marginLeft: "auto",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  betActionsCont: {
    height: "50%",
    width: "100%",
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "column",
  },
  betSizeCont: {
    width: "100%",
  },
  sliderCont: {
    paddingTop: 10,
    width: "100%",
  },
  betInput: {
    paddingRight: 50,
    paddingTop: 25,
  },
  amounts: {
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
  slider: {
    width: "80%",
  },
  button: {
    width: "80%",
    height: "40px",
    backgroundColor: "white",
  },
  sizeButton: {
    margin: 6,
    backgroundColor: "white",
  },
  ...theme.ACTION_BUTTONS,
}));

function Controller(props) {
  const classes = useStyles();
  const {
    toAct,
    unsetCheckCall,
    min,
    max,
    pot,
    sizingButtons,
    actionButtons,
  } = props.controller;

  const [betAmt, setBetAmt] = useState(0);

  const changeBetAmount = (newAmt) => {
    setBetAmt(Math.min(Math.floor(newAmt), max));
  };

  function onClickActionButton(action) {
    server.send({
      actionType: action,
      bettingRoundAction: { type: action, amount: Number(betAmt) },
    });
  }

  return (
    <div className={classes.root}>
      <div className={classes.sizeAndBetActionsCont}>
        <div className={classes.betActionsCont}>
          {actionButtons.map((button) => (
            <Button
              variant="contained"
              className={classnames(classes.button, classes[button.action])}
              onClick={() => onClickActionButton(button.action)}
              disabled={!toAct}
            >
              {button.label}
            </Button>
          ))}
          <TextField
            className={classes.slider}
            onChange={(event) => setBetAmt(event.target.value)}
            value={betAmt}
            type="number"
            variant="outlined"
          />
        </div>
        <div className={classes.betSizeCont}>
          <div className={classes.amounts}>
            {sizingButtons.map((button) => (
              <Button
                variant="outlined"
                className={classes.sizeButton}
                onClick={(e) => changeBetAmount(button.value)}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Controller;
