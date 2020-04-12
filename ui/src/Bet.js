import React from "react";
import get from "lodash/get";
import classnames from "classnames";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  root: {},

  bet: {
    position: "absolute",
    fontSize: "1.4vmin",
    borderRadius: 30,
    padding: "1vmin",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    height: "2vmin",
    width: "2vmin",
    // boxShadow: `0 1px 0 0px white, 0 8px 0 0px black, 0 9px 0 0px white, 0 17px 0 0px black`,
    ...theme.BET,
  },
}));

function Bet(props) {
  const classes = useStyles();
  const { className, style, amount } = props;

  function generateBetBoxShadow() {
    const stackSize = 4;
    const spaceSize = 0.5;
    let boxShadow = "";
    let curSpot = 0;
    for (let i = 1; i < amount; i *= 10) {
      if (i !== 1) boxShadow += ",";
      boxShadow += `0 ${curSpot + spaceSize}px 0 0px white, 0 ${
        curSpot + stackSize
      }px 0 0px black `;
      curSpot += stackSize + spaceSize;
    }
    return boxShadow;
  }
  return (
    <Typography
      className={classnames(classes.bet, className)}
      style={{
        // boxShadow: generateBetBoxShadow(),
        ...style,
      }}
    >
      {amount}
    </Typography>
  );
}

export default Bet;
