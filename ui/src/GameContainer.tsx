import React, { useState, useEffect } from 'react';
import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import queryString from 'query-string';

import Game from './Game';
import { WsServer } from './api/ws';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { EndPoint } from './shared/models/dataCommunication';
import { parseHTTPParams } from './shared/util/util';

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

    const queryParams = parseHTTPParams(queryString.parseUrl(get(props, 'location.search', '')));

    useEffect(() => {
        if (props.useTestGame) {
            dispatch({ type: 'SET_TEST_GAME' });
            if (!gameLoaded) setGameLoaded(true);
        } else {
            const succ = WsServer.openWs(queryParams.gameUUID, EndPoint.GAME);
            if (succ) {
                WsServer.subscribe('game', onReceiveNewGame);
            }
        }
    }, []);

    const onReceiveNewGame = (game: any) => {
        dispatch({ type: 'SET_GAME_STATE', game: game });
        if (!gameLoaded) setGameLoaded(true);
    };

    function renderGame() {
        return <Game />;
    }

    function renderLoading() {
        return <Typography className={classes.loading}>Loading...</Typography>;
    }

    if (gameLoaded) {
        return <div className={classes.root}>{renderGame()}</div>;
    } else {
        return <div className={classes.root}>{renderLoading()}</div>;
    }
}

export default GameContainer;
