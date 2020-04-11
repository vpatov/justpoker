import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import { server } from "./api/ws";

import blue from "@material-ui/core/colors/blue";
import red from "@material-ui/core/colors/red";
import green from "@material-ui/core/colors/green";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/core/Slider";

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
    height: "30%",
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
    height: "20%",
    backgroundColor: "white",
  },
  sizeButton: {
    margin: 6,
    backgroundColor: "white",
  },
}));

function MissionControl(props) {
  const classes = useStyles();
  const { heroStack, pot } = props.missionControl;

  const [betAmt, setBetAmt] = useState(0);

  const changeBetAmount = (newAmt) => {
    setBetAmt(Math.min(Math.floor(newAmt), heroStack));
  };

  function onBet() {
    server.send({
      actionType: "BET",
      bettingRoundAction: { type: "BET", amount: betAmt },
    });
  }
  function onFold() {
    server.send({
      actionType: "FOLD",
      bettingRoundAction: { type: "FOLD", amount: 0 },
    });
  }
  function onCheckCall() {
    server.send({
      actionType: "CHECK",
      bettingRoundAction: { type: "CHECK", amount: 0 },
    });
  }

  if (!props.missionControl) {
    return null;
  }

  return (
    <div className={classes.root}>
      <div className={classes.sizeAndBetActionsCont}>
        <div className={classes.betActionsCont}>
          <Button
            variant="contained"
            className={classes.button}
            style={{ color: red[800] }}
            onClick={() => onFold()}
          >
            Fold
          </Button>
          <Button
            variant="contained"
            className={classes.button}
            style={{ color: blue[800] }}
            onClick={() => onCheckCall()}
          >
            Check
          </Button>
          <Button
            variant="contained"
            className={classes.button}
            style={{ color: green[800] }}
            onClick={() => onBet()}
          >
            {`Bet ${betAmt ? betAmt : ""}`}
          </Button>
          <TextField
            className={classes.slider}
            onChange={(event) => setBetAmt(event.target.value)}
            value={betAmt}
            type="number"
            variant="outlined"
          />
        </div>
        <div className={classes.betSizeCont}>
          <div></div>
          {/* <div className={classes.sliderCont}>
            <Slider
              className={classes.slider}
              value={betAmt}
              step={1}
              valueLabelDisplay="on"
              min={0}
              max={heroStack}
              onChange={(e, v) => setBetAmt(v)}
            />
          </div> */}
          <div className={classes.amounts}>
            <Button
              variant="outlined"
              className={classes.sizeButton}
              onClick={(e) => changeBetAmount(pot * 0.5)}
            >
              1/2
            </Button>
            <Button
              variant="outlined"
              className={classes.sizeButton}
              onClick={(e) => changeBetAmount(pot * 0.75)}
            >
              3/4
            </Button>
            <Button
              variant="outlined"
              className={classes.sizeButton}
              onClick={(e) => changeBetAmount(pot * 1)}
            >
              Pot
            </Button>
            <Button
              variant="outlined"
              className={classes.sizeButton}
              onClick={(e) => changeBetAmount(pot * (Math.random() + 1))}
            >
              Overbet
            </Button>
            <Button
              variant="outlined"
              className={classes.sizeButton}
              onClick={(e) => changeBetAmount(heroStack)}
            >
              Shuv
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MissionControl;
