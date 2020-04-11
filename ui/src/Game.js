import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "./Table";
import MissionControl from "./MissionControl";
// import DarkMode from "./DarkMode";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    ...theme.BACKGROUND,
  },
}));

function Game(props) {
  const classes = useStyles();
  const { table, missionControl, heroInGame } = props.game;

  return (
    <div className={classes.root}>
      <Table table={table} heroInGame={heroInGame} />
      <MissionControl missionControl={missionControl} />
    </div>
  );
}

export default Game;
