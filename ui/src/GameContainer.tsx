import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import Game from "./Game";
import { CleanGame } from "./shared/models/uiState";
import { WsServer } from "./api/ws";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        height: "100vh",
        width: "100vw",
        ...theme.custom.BACKGROUND,
    },
    loading: {
        // fontSize: "3vmin",
    },
}));

function GameContainer(props): any {
    const classes = useStyles();
    const dispatch = useDispatch()
    const [gameLoaded, setGameLoaded] = useState(false);



    useEffect(() => {
        if (props.useTestGame) {
            dispatch({ type: "SET_TEST_GAME" });
            if (!gameLoaded) setGameLoaded(true);
        } else {
            const succ = WsServer.openWs();
            if (succ) {
                WsServer.subscribe("game", onReceiveNewGame);
            }
        }
    }, []);

    const onReceiveNewGame = (game: any) => {
        dispatch({ type: "SET_GAME_STATE", game: game });
        if (!gameLoaded) setGameLoaded(true);
    };

    function renderGame() {
        return <Game />;
    }

    function renderLoading() {
        return <Typography className={classes.loading}>Loading....</Typography>;
    }

    if (gameLoaded) {
        return <div className={classes.root}>{renderGame()}</div>;
    } else {
        return <div className={classes.root}>{renderLoading()}</div>;
    }


}

export default GameContainer;
