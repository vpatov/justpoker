import React, { Fragment, useState, useEffect } from "react";
import Player from "./Player";
import OpenSeat from "./OpenSeat";
import Bet from "./Bet";
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
  tableCont: {
    // transition: "transform 2s linear 0s",
    // "&:hover": {
    //   transform: "translate(0vw, -100vh)",
    // },
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
    // transition: "transform 2s linear 0s",
    // "&:hover": {
    //   transform: "rotateX(720deg)",
    // },
  },
  spot: {
    position: "absolute",
  },
  pot: {
    fontSize: "3vmin",
    position: "absolute",
    transform: "translateY(-10vh)",
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "white",
    borderRadius: 40,
    padding: "12px 36px",
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

  const playerPosScale = 0.4;
  const betPosScale = 0.26;

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
              <Bet
                style={{
                  transform: `translate(${xPos * betPosScale}px,${
                    yPos * betPosScale
                  }px)`,
                }}
                amount={player.bet}
              />
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
      <div className={classes.tableCont}>
        <div className={classes.table}>
          <Typography
            className={classes.pot}
          >{`${pot.toLocaleString()}`}</Typography>
          <CommunityCards communityCards={communityCards} />
        </div>
      </div>
      {createSpotsAtTable()}
    </div>
  );
}

export default Table;
