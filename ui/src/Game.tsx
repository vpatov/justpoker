import React from 'react';
import classnames from 'classnames';

import Table from './Table';
import Controller from './Controller';
import AudioModule from './AudioModule';
import AnimiationModule from './AnimiationModule';
import LogPanel from './LogPanel';
import GameMenu from './GameMenu';
import GameLabel from './GameLabel';
import ControllerTimer from './ControllerTimer';
import GameDisconnetionMessage from './GameDisconnectionMessage';
import ReactionPicker from './ReactionPicker';

import { makeStyles } from '@material-ui/core/styles';
import { useStickyState } from './utils';

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
    logPanel: {},
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

const MUTE_LOCAL_STORAGE_KEY = 'jp-last-used-mute';

function Game(props) {
    const [mute, SET_mute] = useStickyState(false, MUTE_LOCAL_STORAGE_KEY);
    const classes = useStyles();
    const { wsConnClosed } = props;
    return (
        <>
            {wsConnClosed ? <GameDisconnetionMessage /> : null}
            <div className={classnames(classes.root, { [classes.disabled]: wsConnClosed })}>
                <GameMenu mute={mute} SET_mute={SET_mute} />
                <ReactionPicker />
                <div className={classes.gameTableCont}>
                    <GameLabel />
                    <Table className={classes.table} />
                    <ControllerTimer />
                    <Controller className={classes.controller} />
                </div>
                <LogPanel className={classes.logPanel} />

                <AudioModule mute={mute} />
                <AnimiationModule />
            </div>
        </>
    );
}

export default Game;
