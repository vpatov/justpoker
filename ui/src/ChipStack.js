import React from "react";
import get from "lodash/get";
import classnames from "classnames";
import Chip from "./Chip";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // flexDirection: "column",
  },
  svgCont: {
    position: "relative",
    // height: "4vmin",
    // width: "3vmin",
  },
}));

function ChipStack(props) {
  const classes = useStyles();
  const { className, amount } = props;

  function generateAStackOfChips(chipSize, numChips) {
    const chips = [];
    const chipOffest = 4.5;
    let yPos = 80;
    for (let i = 0; i < numChips; i++) {
      yPos -= chipOffest;
      chips.push(<Chip amount={chipSize} yPos={`${yPos}%`} />);
    }
    return (
      <svg
        className={classes.svgCont}
        viewBox="0 0 100 200"
        width="3vmin"
        height="6vmin"
        preserveAspectRatio="none"
      >
        {chips}
      </svg>
    );
  }

  function generatesChipsStacksFromAmount(amount) {
    const chipsStacks = [];
    let remaining = amount;

    for (let j = 0; remaining > 0; j++) {
      const bigChip = Math.pow(10, Math.floor(Math.log10(remaining)));
      const numBigChips = Math.floor(remaining / bigChip);

      chipsStacks.push(generateAStackOfChips(bigChip, numBigChips));
      remaining = remaining % bigChip;
    }

    return chipsStacks;
  }
  return (
    <div className={classes.root}>{generatesChipsStacksFromAmount(amount)}</div>
  );
}

export default ChipStack;
