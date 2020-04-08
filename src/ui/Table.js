import React, { Fragment, useState } from "react";
import Player from "./Player";
import OpenSeat from "./OpenSeat";
import Card from "./Card";

import { makeStyles } from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";
import blue from "@material-ui/core/colors/blue";
import Typography from "@material-ui/core/Typography";

const tableHeightPercent = 65;
const tableWidthPercent = 65;
const tableAspectRatio = tableWidthPercent / tableHeightPercent;

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    ...theme.BACKGROUND,
  },
  table: {
    transform: "translateY(-8%)",
    height: tableHeightPercent + "%",
    width: tableWidthPercent + "%",
    borderRadius: "50%",
    margin: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    ...theme.TABLE,
  },
  spot: {
    position: "absolute",
  },
  communityCards: {
    height: "25%",
    width: "65%",
    display: "flex",
    justifyContent: "flex-start",
  },
  pot: {
    fontSize: 42,
    position: "absolute",
    transform: "translateY(-12vh)",
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "white",
    borderRadius: 40,
    padding: "12px 36px",
  },
  button: {
    position: "absolute",
    zIndex: 10,
    backgroundColor: "gold",
    width: 30,
  },

  bet: {
    position: "absolute",
    fontSize: "16px",
    borderRadius: 30,
    minWidth: "30px",
    padding: "0 10px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    ...theme.BET,
  },
}));

function Table(props) {
  const classes = useStyles();
  const { players, communityCards, spots, pot } = props.table;

  const playerPosScale = 0.35;
  const betPosScale = 0.27;

  function createSpotsAtTable() {
    const ans = [];

    for (let index = 0; index < spots; index++) {
      const xPos =
        Math.cos((2 * 3.14 * index) / spots) *
        window.innerWidth *
        tableAspectRatio;
      const yPos = Math.sin((2 * 3.14 * index) / spots) * window.innerHeight;

      const player = players.find((p) => p.position === index);
      if (player) {
        ans.push(
          <Fragment>
            <Player
              player={player}
              className={classes.spot}
              style={{
                transform: `translate(${xPos * playerPosScale}px,${
                  yPos * playerPosScale
                }px)`,
              }}
            />
            {player.bet ? (
              <div
                className={classes.bet}
                style={{
                  transform: `translate(${xPos * betPosScale}px,${
                    yPos * betPosScale
                  }px)`,
                }}
              >
                {player.bet}
              </div>
            ) : null}
          </Fragment>
        );
      } else {
        ans.push(
          <OpenSeat
            className={classes.spot}
            style={{
              transform: `translate(${xPos * playerPosScale}px,${
                yPos * playerPosScale
              }px)`,
            }}
          />
        );
      }
    }
    return ans;
  }
  return (
    <div className={classes.root}>
      <div className={classes.table}>
        <div className={classes.pot}>
          <Typography variant="h4">{`POT: ${pot}`}</Typography>
        </div>
        <div className={classes.communityCards}>
          {communityCards.map((c) => (
            <Card
              suit={c.suit}
              number={c.number}
              fontSize={44}
              style={{
                width: "18%",
                margin: 6,
              }}
            />
          ))}
        </div>
        {createSpotsAtTable()}
      </div>
    </div>
  );
}

export default Table;
