import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {} from "./utils";
import classnames from "classnames";
import Card from "./Card";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "50%",
  },
}));

function Hand(props) {
  const classes = useStyles();
  const { hidden, folded } = props;
  const { cards } = props.hand;

  return (
    <div className={classes.root}>
      {cards.map((c) => (
        <Card suit={c.suit} rank={c.rank} hidden={hidden} folded={folded}size="small" />
      ))}
    </div>
  );
}

export default Hand;
