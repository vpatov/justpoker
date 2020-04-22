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
        height: "100vh",
        width: "100vw",
        ...theme.custom.BACKGROUND,
    },
    gameChatCont: {
        display: "flex",
        height: "85vmin",
        width: '100%',
        overflow: "hidden"
    },
    table: {
        flex: "1 1 100%",
    },
    chatlog: {

    },
    controller: {

    },
    hideButton: {
        margin: "2vmin",
        zIndex: 5,
        position: "fixed",
        bottom: 0,
        right: 0,
        height: "3vmin"
    },
}));

export interface GameProps {
    game: UiGameState;
}

function Game(props: GameProps) {
    const classes = useStyles();
    const { table, controller, heroInGame } = props.game;

    const [hideChat, setHideChat] = useState(false);


    function renderHideChatButton() {
        return (<Button
            className={classes.hideButton}
            onClick={(e) =>
                setHideChat(!hideChat)
            }
        >
            {`${hideChat ? "Show" : "Hide"} Chat`}
        </Button>)
    }

    return (
        <div className={classes.root}>
            <div className={classes.gameChatCont}>
                <Table table={table} heroInGame={heroInGame} className={classes.table} />
                <ChatLog className={classes.chatlog} hideChat={hideChat} />
                {renderHideChatButton()}
            </div>
            <Controller controller={controller} className={classes.controller} />
            <AudioModule />
        </div>
    );
}

export default Game;
