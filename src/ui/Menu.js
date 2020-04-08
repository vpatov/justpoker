import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {} from "./utils";
import classnames from "classnames";
import Card from "./Card";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "90%",
    height: "50%",
    display: "flex",
    justifyContent: "space-evenly",
  },
}));

function Menu(props) {
  const classes = useStyles();
  // const { cards } = props.hand;

  return (<div>Menu</div>);

  
  // return (
  //   <div className={classes.root}>
  //     {cards.map((c) => (
  //       <Card
  //         suit={c.suit}
  //         number={c.number}
  //         hidden={hidden}
  //         textPosition="top"
  //       />
  //     ))}
  //   </div>
  // );
  
}

export default Menu;
