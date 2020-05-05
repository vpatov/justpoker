import React from 'react';

import Table from './Table';
import Controller from './Controller';
import AudioModule from './AudioModule';
import AnimiationModule from './AnimiationModule';
import ChatLog from './ChatLog';
import GameMenu from './GameMenu';
import GameLabel from './GameLabel';
import ControllerTimer from './ControllerTimer';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
        width: '100%',
        display: 'flex',
    },
    gameTableCont: {
        height: '100%',
        position: 'relative',
        flex: '1 1 100%',
    },
    table: {
        height: '85%',
    },
    chatlog: {
        width: '300px',
    },
    controller: {
        height: '15%',
        width: '100%',
    },
    hideButton: {
        margin: '2vmin',
        fontSize: '1vmin',
        zIndex: 5,
        position: 'absolute',
        top: 0,
        right: '0',
    },
}));

function Game(props) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <GameMenu />
            <div className={classes.gameTableCont}>
                <GameLabel />
                <Table className={classes.table} />
                <ControllerTimer />
                <Controller className={classes.controller} />
            </div>
            <ChatLog className={classes.chatlog} />

            <AudioModule />
            <AnimiationModule />
        </div>
    );
}

export default Game;
