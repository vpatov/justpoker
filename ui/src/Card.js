import React from "react";

import { generateStringFromSuitAndRank, SUITS } from "./utils";
import classnames from "classnames";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    width: "40%",
    border: "2px solid white",
    borderRadius: 6,
    display: "inline-block",
    textAlign: "center",
  },
  valueText: {
    fontSize: "1.8vmin",
    color: "white",
    display: "inline-block",
  },
  hidden: {
    ...theme.HIDDEN,
  },
  center: {
    position: "relative",
    top: "50%",
    transform: "translateY(-50%)",
    textAlign: "center",
  },
  top: {
    paddingTop: "0.5vmin",
    position: "relative",
    textAlign: "center",
  },
  side: {
    position: "relative",
    overflowWrap: "break-word",
    width: "60%",
  },
  [SUITS.HEARTS]: {
    ...theme.HEARTS,
  },
  [SUITS.SPADES]: {
    ...theme.SPADES,
  },
  [SUITS.CLUBS]: {
    ...theme.CLUBS,
  },
  [SUITS.DIAMONDS]: {
    ...theme.DIAMONDS,
  },
}));

function Card(props) {
  const classes = useStyles();
  const {
    suit,
    rank,
    textPosition,
    fontSize,
    style,
    hidden,
    className,
  } = props;

  if (hidden) {
    return (
      <div
        className={classnames(classes.root, classes.hidden, className)}
        style={style}
      />
    );
  }
  return (
    <div
      className={classnames(classes.root, classes[suit], className)}
      style={style}
    >
      <Typography
        className={classnames(
          classes.valueText,
          classes[textPosition || "center"],
          classes[suit]
        )}
        style={{ fontSize: fontSize }}
      >
        {generateStringFromSuitAndRank(suit, rank)}
      </Typography>
    </div>
  );
}

export default Card;
