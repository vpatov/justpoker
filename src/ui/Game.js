import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "./Table";
import Menu from "./Menu";
import MissionControl from "./MissionControl";
// import DarkMode from "./DarkMode";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
  },
}));

function Game(props) {
  const classes = useStyles();
  const { table, missionControl } = props.game;

  return (
    <div className={classes.root}>
      <Menu/>
      <Table table={table} />
      <MissionControl missionControl={missionControl} />
    </div>
  );
}

export default Game;
