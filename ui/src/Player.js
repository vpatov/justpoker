import React, { useState } from "react";
import classnames from "classnames";
import Hand from "./Hand";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ButtonSvg from "./imgs/button.svg";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "9vw",
    height: "12vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  stackCont: {
    marginTop: -12,
    padding: "0.5vmin",
    width: "100%",
    textAlign: "center",
    fontSize: "18px",
    ...theme.STACK,
  },
  name: {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    textAlign: "center",
    fontSize: "1.2vmin",
  },
  stack: {
    fontSize: "1.7vmin",
  },

  button: {
    position: "absolute",
    height: "2.2vmin",
    left: 0,
    top: "50%",
    zIndex: 5,
  },
  act: {
    backgroundColor: "rgba(0, 236, 255, 1)",
  },

  winner: {
    "&:before": {
      zIndex: -1,
      position: "absolute",
      content: '""',
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      boxShadow: `0px 0px 3px 3px rgba(5,255,5,1)`,
      "-webkit-animation": "$beacon 0.8s infinite linear",
      animation: "$beacon 0.5s infinite linear",
    },
  },
  toAct: {
    "&:before": {
      zIndex: -1,
      position: "absolute",
      content: '""',
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      boxShadow: `0px 0px 16px 16px rgba(0,236,255,1)`,
      "-webkit-animation": "$beacon 1.8s infinite linear",
      animation: "$beacon 1.8s infinite linear",
    },
  },
  "@keyframes beacon": {
    "0%": {
      transform: "scale(.1)",
      opacity: 1,
    },
    "70%": {
      transform: "scale(2)",
      opacity: 0,
    },
    "100%": {
      opacity: 0,
    },
  },
}));

function Player(props) {
  const classes = useStyles();
  const { className, style } = props;
  const {
    stack,
    hand,
    name,
    toAct,
    hero,
    bet,
    button,
    position,
    winner,
  } = props.player;

  return (
    <div
      className={classnames(classes.root, className, {
        [classes.toAct]: toAct,
        [classes.winner]: winner,
      })}
      style={style}
    >
      <Hand hand={hand} hidden={!hero} />
      <div
        className={classnames(classes.stackCont, {
          [classes.act]: toAct,
        })}
      >
        {button ? <img src={ButtonSvg} className={classes.button} /> : null}

        <Typography variant="h4" className={classes.stack}>
          {stack.toLocaleString()}
        </Typography>
        <Typography variant="body1" className={classes.name}>
          {name}
        </Typography>
      </div>
    </div>
  );
}

export default Player;
