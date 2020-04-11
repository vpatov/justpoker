import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "./Table";
import Controller from "./Controller";
// import DarkMode from "./DarkMode";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    width: "100vw",
    ...theme.BACKGROUND,
  },
}));

function Game(props) {
  const classes = useStyles();
  const { table, controller, heroInGame } = props.game;

  return (
    <div className={classes.root}>
      <Table table={table} heroInGame={heroInGame} />
      <Controller controller={controller} />
    </div>
  );
}

export default Game;
