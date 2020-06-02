import React from 'react';
import classnames from 'classnames';
import Table from './Table';
import Controller from './Controller';
import AudioModule from './AudioModule';
import AnimiationModule from './AnimiationModule';
import ChatLog from './ChatLog';
import GameMenu from './GameMenu';
import GameLabel from './GameLabel';
import ControllerTimer from './ControllerTimer';
import GameDisconnetionMessage from './GameDisconnetionMessage';
import ReactionPicker from './ReactionPicker';

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
        overflow: 'hidden',
    },
    table: {
        height: '85%',
    },
    chatlog: {},
    controller: {
        height: '15%',
        width: '100%',
    },
    disabled: {
        transition: 'opacity 0.15s linear',
        opacity: 0.3,
        pointerEvents: 'none',
    },
}));

function Game(props) {
    const classes = useStyles();
    const { wsConnClosed } = props;
    return (
        <>
            {wsConnClosed ? <GameDisconnetionMessage /> : null}
            <div className={classnames(classes.root, { [classes.disabled]: wsConnClosed })}>
                <GameMenu />
                <ReactionPicker />
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
        </>
    );
}

export default Game;
