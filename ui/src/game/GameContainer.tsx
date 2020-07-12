import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import ErrorMessage from '../root/ErrorMessage';
import Game from './Game';
import { WsServer } from '../api/ws';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ErrorDisplay } from '../shared/models/ui/uiState';
import { GameInstanceUUID } from '../shared/models/system/uuid';
import { useParams } from 'react-router';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        width: '100vw',
        color: 'white',
        ...theme.custom.BACKGROUND,
    },
    loading: {
        fontSize: '4vmin',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    },
}));

function GameContainer(props): any {
    const classes = useStyles();
    const dispatch = useDispatch();
    const [gameLoaded, setGameLoaded] = useState(false);
    const [error, setError] = useState<ErrorDisplay | undefined>();
    const [wsConnClosed, SET_wsConnClosed] = useState(false);

    const { gameInstanceUUID } = useParams();

    useEffect(() => {
        const onReceiveNewGame = (game: any) => {
            dispatch({ type: 'SET_GAME_STATE', game: game });
            if (!gameLoaded) setGameLoaded(true);
        };

        if (props.useTestGame) {
            dispatch({ type: 'SET_TEST_GAME' });
            if (!gameLoaded) setGameLoaded(true);
        } else {
            const succ = WsServer.openWs(gameInstanceUUID as GameInstanceUUID);
            if (succ) {
                WsServer.subscribe('game', onReceiveNewGame);
                WsServer.subscribe('error', onReceiveError);
                WsServer.subscribe('onclose', onWSClosed);
            }
        }
    }, [dispatch, gameInstanceUUID, gameLoaded, props.useTestGame]);

    const onWSClosed = () => {
        SET_wsConnClosed(true);
    };

    const onReceiveError = (error: any) => {
        setError(error);
    };

    function renderError() {
        return <ErrorMessage errorDisplay={error as ErrorDisplay} />;
    }

    function renderGame() {
        return <Game wsConnClosed={wsConnClosed} />;
    }

    function renderLoading() {
        return <Typography className={classes.loading}>Loading...</Typography>;
    }

    if (error !== undefined) {
        return <div className={classes.root}>{renderError()}</div>;
    } else if (gameLoaded) {
        return <div className={classes.root}>{renderGame()}</div>;
    } else {
        return <div className={classes.root}>{renderLoading()}</div>;
    }
}

export default GameContainer;
