import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {} from "./utils";
import classnames from "classnames";
import MakeGame from "./MakeGame";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    background: `radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%)`,
  },
  title: {
    margin: 36,
  },
}));

function Home(props) {
  const classes = useStyles();
  const {} = props;

  return (
    <div className={classes.root}>
      <Typography variant="h1" className={classes.title}>
        Poker Friends
      </Typography>
      <MakeGame />
    </div>
  );
}

export default Home;
