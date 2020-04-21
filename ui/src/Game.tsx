import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "./Table";
import Controller from "./Controller";
import AudioModule from "./AudioModule";

import { UiGameState } from "./shared/models/uiState";
import ChatLog from "./ChatLog";
const useStyles = makeStyles((theme) => ({
    root: {
        height: "100vh",
        width: "100vw",
        ...theme.custom.BACKGROUND,
        display: "grid",
        gridTemplateAreas: "\"chatLog table controller\""
    },
}));

export interface GameProps {
    game: UiGameState;
}

function Game(props: GameProps) {
    const classes = useStyles();
    const { table, controller, heroInGame } = props.game;

    return (
        <div className={classes.root}>
            <Table table={table} heroInGame={heroInGame} />
            <ChatLog></ChatLog>
            <Controller controller={controller} />
            <AudioModule />
        </div>
    );
}

export default Game;
