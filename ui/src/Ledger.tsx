import React, { useState } from "react";
import { } from "./utils";
import { withRouter } from "react-router-dom";


import { makeStyles } from "@material-ui/core/styles";


const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        margin: "2vmin",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        border: "1px solid black",
        padding: 12,
    },
}));


function Ledger(props) {
    const classes = useStyles();
    const { ledger } = props;

    return (
        <div>
            Ledger
        </div>
    )
}
export default withRouter(Ledger);
