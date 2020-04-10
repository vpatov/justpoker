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
  name: {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    textAlign: "center",
    fontSize: "14px",
  },
  stack: {
    marginTop: -12,
    padding: 4,
    width: "100%",
    textAlign: "center",
    fontSize: "18px",
    ...theme.STACK,
  },

  button: {
    position: "absolute",
    height: 40,
    right: -4,
    top: -18,
  },
  act: {
    backgroundColor: "rgba(0, 236, 255, 1)",
  },
  beacon: {
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
    "&:hover": {
      "-webkit-transform": "scale(1.3)",
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
  const { stack, hand, name, toAct, hero, bet, button, position, winner } = props.player;

  return (
    <div
      className={classnames(classes.root, className, {
        [classes.beacon]: toAct,
      })}
      style={style}
    >
      {button ? <img src={ButtonSvg} className={classes.button} /> : null}

      <Hand hand={hand} hidden={!hero} />
      <div
        className={classnames(classes.stack, {
          [classes.act]: toAct,
        })}
      >
        <Typography variant="subtitle">{stack}</Typography>
        <Typography variant="body1" className={classes.name}>
          {name + " " + winner}
        </Typography>
      </div>
    </div>
  );
}

export default Player;
