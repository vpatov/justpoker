import React, { Fragment, useState, useEffect } from "react";
import Player from "./Player";
import OpenSeat from "./OpenSeat";
import CommunityCards from "./CommunityCards";
import { debounce } from "./utils";

import { makeStyles } from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";
import blue from "@material-ui/core/colors/blue";
import Typography from "@material-ui/core/Typography";

const tableHeightPercent = 65;
const tableWidthPercent = 65;

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    width: "80%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  table: {
    height: tableHeightPercent + "vmin",
    width: tableWidthPercent + "vmin",
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

  pot: {
    fontSize: "3vmin",
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
    fontSize: "1.4vmin",
    borderRadius: 30,
    padding: "1vmin",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    ...theme.BET,
  },
}));

function Table(props) {
  const classes = useStyles();
  const { heroInGame } = props;
  const { players, communityCards, spots, pot } = props.table;

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });
  useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }, 350);

    window.addEventListener("resize", debouncedHandleResize);

    return (_) => {
      window.removeEventListener("resize", debouncedHandleResize);
    };
  });

  const playerPosScale = 0.38;
  const betPosScale = 0.25;

  function createSpotsAtTable() {
    const ans = [];

    for (let index = 0; index < spots; index++) {
      const vmin = Math.min(dimensions.width, dimensions.height);
      const xPos = Math.cos((2 * 3.14 * index) / spots) * vmin;
      const yPos = Math.sin((2 * 3.14 * index) / spots) * vmin;

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
              <Typography
                className={classes.bet}
                style={{
                  transform: `translate(${xPos * betPosScale}px,${
                    yPos * betPosScale
                  }px)`,
                }}
              >
                {player.bet}
              </Typography>
            ) : null}
          </Fragment>
        );
      } else if (!heroInGame) {
        ans.push(
          <OpenSeat
            seatNumber={index}
            className={classes.spot}
            style={{
              transform: `translate(${xPos * playerPosScale}px,${
                yPos * playerPosScale
              }px)`,
            }}
          />
        );
      } else {
        ans.push(null);
      }
    }
    return ans;
  }
  return (
    <div className={classes.root}>
      <div className={classes.table}>
        <Typography className={classes.pot}>{`POT: ${pot}`}</Typography>

        <CommunityCards communityCards={communityCards} />
        {createSpotsAtTable()}
      </div>
    </div>
  );
}

export default Table;
