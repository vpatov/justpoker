import React from "react";
import get from "lodash/get";
import {} from "./utils";

import purple from "@material-ui/core/colors/purple";
import pink from "@material-ui/core/colors/pink";
import grey from "@material-ui/core/colors/grey";
import green from "@material-ui/core/colors/green";
import lightGreen from "@material-ui/core/colors/lightGreen";
import cyan from "@material-ui/core/colors/cyan";
import lime from "@material-ui/core/colors/lime";
import yellow from "@material-ui/core/colors/yellow";
import orange from "@material-ui/core/colors/orange";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  svgCircle: {
    strokeWidth: "5%",
    cx: "50%",
    cy: "50%",
    r: "28%",
  },
  svgInnerCircle: {
    strokeWidth: "2.5%",
    cx: "50%",
    cy: "50%",
    r: "10%",
  },
}));

export const MAX_CHIP_SIZE = Math.pow(10, 7);

function Chip(props) {
  const classes = useStyles();
  const { yPos, xPos, amount } = props;

  function getChipHueFromAmount(amount) {
    if (MAX_CHIP_SIZE < amount) {
      return grey;
    }
    const hues = [cyan, green, lime, purple, lightGreen, yellow, pink, orange];
    const hueIndex = Math.floor(Math.log10(amount));
    return hues[hueIndex];
  }

  const hue = getChipHueFromAmount(amount);

  return [
    <circle
      className={classes.svgCircle}
      stroke={hue[100]}
      fill={hue.A400}
      style={{ cy: yPos, cx: xPos }}
    />,
    <circle
      className={classes.svgCircle}
      fill={"none"}
      stroke={hue[700]}
      strokeDasharray="5%, 5%"
      style={{ cy: yPos, cx: xPos }}
    />,
    <circle
      className={classes.svgInnerCircle}
      stroke={"white"}
      style={{ cy: yPos, cx: xPos }}
    />,
    <circle
      className={classes.svgInnerCircle}
      stroke={"black"}
      fill={"white"}
      strokeDasharray="6%"
      style={{ cy: yPos, cx: xPos }}
    />,
  ];
}

export default Chip;
