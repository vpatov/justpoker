import React, { useState } from "react";

import Table from "./Table";
import Controller from "./Controller";
import AudioModule from "./AudioModule";
import { UiGameState } from "./shared/models/uiState";
import ChatLog from "./ChatLog";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
    root: {
        height: "100%",
        width: "100%",
    },
    gameChatCont: {
        display: "flex",
        height: "85vh",
        width: "100%",
        overflow: "hidden",
    },
    table: {
        flex: "1 1 100%",
    },
    chatlog: {},
    controller: {},
    hideButton: {
        margin: "2vmin",
        fontSize: "1vmin",

        zIndex: 5,
        position: "fixed",
        bottom: 0,
        right: 0,
    },
}));

function Game(props) {
    const classes = useStyles();
    const [hideChat, setHideChat] = useState(false);

    function renderHideChatButton() {
        return (
            <Button
                className={classes.hideButton}
                onClick={(e) => setHideChat(!hideChat)}
            >
                {`${hideChat ? "Show" : "Hide"} Chat`}
            </Button>
        );
    }

    return (
        <div className={classes.root}>
            <div className={classes.gameChatCont}>
                <Table className={classes.table} />
                <ChatLog className={classes.chatlog} hideChat={hideChat} />
                {renderHideChatButton()}
            </div>
            <Controller className={classes.controller} />
            <AudioModule />
        </div>
    );
}

export default Game;
