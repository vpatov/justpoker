import React, { useState } from 'react';
import classnames from 'classnames';

import { flipTable, dealCards } from './AnimiationModule';
import { WsServer } from './api/ws';
import { ActionType, ClientWsMessageRequest } from './shared/models/wsaction';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import AdminIcon from '@material-ui/icons/SupervisorAccount';
import SeatIcon from '@material-ui/icons/EventSeat';
import QuitIcon from '@material-ui/icons/Clear';
import StartIcon from '@material-ui/icons/PlayArrow';
import SettingsIcon from '@material-ui/icons/Settings';
import VolumeOnIcon from '@material-ui/icons/VolumeUp';
import MenuIcon from '@material-ui/icons/Menu';
import FlipIcon from '@material-ui/icons/FlipSharp';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        hoverArea: {
            zIndex: 5,
            position: 'fixed',
            left: 0,
            top: 0,
            width: '7vw',
            height: '45vh',
        },
        root: {
            zIndex: 5,
            position: 'fixed',
            left: 0,
            top: 0,
            margin: '2vmin',
            fontSize: '1vmin',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease-in-out',
            maxHeight: '5vmin',
            overflow: 'hidden',
        },
        rootExpanded: {
            transition: 'max-height 0.3s ease-in-out',
            maxHeight: '90vh',
        },

        tooltip: {
            fontSize: '1vmin',
            display: 'flex',
        },
        iconButton: {
            height: '5vmin',
            width: '5vmin',
            borderRadius: '5%',
        },
        icon: {
            fontSize: '2.5vmin',
        },
    }),
);

function Default(props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const actions = [
        { icon: <QuitIcon className={classes.icon} />, name: 'Quit' },
        { icon: <VolumeOnIcon className={classes.icon} />, name: 'Volume' },
        { icon: <SettingsIcon className={classes.icon} />, name: 'Settings' },
        { icon: <AdminIcon className={classes.icon} />, name: 'Admin' },
        { icon: <FlipIcon className={classes.icon} />, name: 'Flip Table', onClick: () => flipTable() },
        { icon: <FlipIcon className={classes.icon} />, name: 'Animate Deal', onClick: () => dealCards() },
    ];

    function sendServerAction(action) {
        WsServer.send({
            actionType: action,
            request: {} as ClientWsMessageRequest,
        });
    }

    return (
        <>
            <div className={classes.hoverArea} onMouseOver={handleOpen} onMouseLeave={handleClose}>
                <Paper
                    elevation={4}
                    className={classnames(classes.root, {
                        [classes.rootExpanded]: open,
                    })}
                >
                    {open ? (
                        actions.map((action) => (
                            <Tooltip title={action.name} placement="right">
                                <IconButton className={classes.iconButton} onClick={action.onClick}>
                                    {action.icon}
                                </IconButton>
                            </Tooltip>
                        ))
                    ) : (
                        <IconButton className={classes.iconButton}>
                            <MenuIcon className={classes.icon} />
                        </IconButton>
                    )}
                </Paper>
            </div>
        </>
    );
}

export default Default;
