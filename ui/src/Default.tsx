import React from "react";
import get from "lodash/get";
import {} from "./utils";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

function Default(props) {
  const classes = useStyles();
  const {} = props;

  return <div className={classes.root}></div>;
}

export default Default;
