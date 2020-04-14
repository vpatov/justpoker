import React, { Fragment } from "react";
import Chip from "./Chip";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "11vmin",
    flexWrap: "wrap",
    flexDirection: "row-reverse",
  },
  svgCont: {
    position: "relative",
    marginTop: "-3vmin",
  },
}));

export const MAX_STACK_SIZE = Math.pow(10, 6);

function ChipStack(props) {
  const classes = useStyles();
  const { amount } = props;

  function generateAStackOfChips(chipSize, numChips): JSX.Element {
    const chips = [] as any;
    const chipOffest = 4;
    let yPos = 80;
    for (let i = 0; i < numChips; i++) {
      yPos -= chipOffest;
      const chipComp = <Chip amount={chipSize} yPos={`${yPos}%`} />;
      chips.push(chipComp);
    }
    return (
      <svg
        className={classes.svgCont}
        viewBox="0 0 100 200"
        width="3vmin"
        height="6vmin"
      >
        <Fragment> {chips}</Fragment>
      </svg>
    );
  }

  function generatesChipsStacksFromAmount(amount) {
    if (amount > MAX_STACK_SIZE) {
      return generateAStackOfChips(amount, 1);
    }
    const chipsStacks = [] as any;
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
