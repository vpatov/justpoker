import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { generateStringFromSuitNumber, SUITS } from "./utils";
import classnames from "classnames";
const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    width: "40%",
    border: "2px solid white",
    borderRadius: 6,
  },
  valueText: {
    fontSize: "20px",
    color: "white",
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
  const { suit, number, textPosition, fontSize, style, hidden } = props;

  if (hidden) {
    return (
      <div className={classnames(classes.root, classes.hidden)} style={style} />
    );
  }
  return (
    <div className={classnames(classes.root, classes[suit])} style={style}>
      <div
        className={classnames(
          classes.valueText,
          classes[textPosition || "center"],
          classes[suit]
        )}
        style={{ fontSize: fontSize }}
      >
        {generateStringFromSuitNumber(suit, number)}
      </div>
    </div>
  );
}

export default Card;
