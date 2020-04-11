import React from "react";
import get from "lodash/get";
import Card from "./Card";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  communityCardsCont: {
    height: "25%",
    width: "65%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  communityCard: {
    width: "15%",
    height: "50%",
    margin: 4,
  },
}));

function CommunityCards(props) {
  const classes = useStyles();
  const { communityCards } = props;

  return (
    <div className={classes.communityCardsCont}>
      {communityCards.map((c) => (
        <Card
          suit={c.suit}
          rank={c.rank}
          fontSize={"2.5vmin"}
          className={classes.communityCard}
        />
      ))}
    </div>
  );
}

export default CommunityCards;
