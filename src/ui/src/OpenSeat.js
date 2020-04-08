import React, { useState } from "react";
import classnames from "classnames";
import Hand from "./Hand";

import { makeStyles } from "@material-ui/core/styles";
import yellow from "@material-ui/core/colors/yellow";
import grey from "@material-ui/core/colors/grey";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "9vmin",
    height: "9vmin",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: `2px solid ${grey[500]}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    backgroundColor: grey[400],
    cursor: "pointer",
    "&:hover": {
      borderColor: grey[100],
      backgroundColor: grey[200],
    },
  },
}));

function OpenSeat(props) {
  const classes = useStyles();
  const { className, style } = props;

  return (
    <div className={classnames(classes.root, className)} style={style}>
      <Typography variant="body2">Sit Here</Typography>
    </div>
  );
}

export default OpenSeat;
