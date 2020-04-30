import React, { useState } from "react";

import Table from "./Table";
import Controller from "./Controller";
import AudioModule from "./AudioModule";
import { UiGameState } from "./shared/models/uiState";
import ChatLog from "./ChatLog";
import GameMenu from "./GameMenu";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
    root: {
        height: "100%",
        width: "100%",
        display: "flex",
    },
    gameTableCont: {
        height: "100%",
        width: "calc(100%- 300px)",
        position: "relative",
        flex: "1 1 100%",
    },
    table: {
        height: "85%",
    },
    chatlog: {
        width: "300px",
    },
    controller: {
        height: "15%",
        width: "100%",
    },
    hideButton: {
        margin: "2vmin",
        fontSize: "1vmin",
        zIndex: 5,
        position: "absolute",
        top: 0,
        right: "0",
    },
}));

function Game(props) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <GameMenu />
            <div className={classes.gameTableCont}>
                <Table className={classes.table} />
                <Controller className={classes.controller} />
            </div>
            <ChatLog className={classes.chatlog} />

            <AudioModule />
        </div>
    );
}

export default Game;
