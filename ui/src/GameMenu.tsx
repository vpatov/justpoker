import React from 'react';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { selectMenuButtons } from './store/selectors';
import { flipTable } from './AnimiationModule';
import { WsServer } from './api/ws';
import { ActionType, ClientWsMessageRequest } from './shared/models/wsaction';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import AdminIcon from '@material-ui/icons/SupervisorAccount';
import QuitIcon from '@material-ui/icons/Clear';
import StartIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
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

function getIcon(action, iconClass) {
    const ACTION_TO_ICON = {
        [ActionType.ADMIN]: <AdminIcon className={iconClass} />,
        [ActionType.SETTINGS]: <SettingsIcon className={iconClass} />,
        [ActionType.VOLUME]: <VolumeOnIcon className={iconClass} />,
        [ActionType.LEAVETABLE]: <QuitIcon className={iconClass} />,
        [ActionType.STOPGAME]: <StopIcon className={iconClass} />,
        [ActionType.STARTGAME]: <StartIcon className={iconClass} />,
    };
    return ACTION_TO_ICON[action];
}

function GameMenu(props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const menuButtons = useSelector(selectMenuButtons);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    function handleClickButton(action) {
        switch (action) {
            case ActionType.ADMIN:
                break;
            case ActionType.SETTINGS:
                break;
            case ActionType.VOLUME:
                break;
            case ActionType.LEAVETABLE:
                sendServerAction(ActionType.LEAVETABLE);

            case ActionType.STOPGAME:
                sendServerAction(ActionType.STOPGAME);

            case ActionType.STARTGAME:
                sendServerAction(ActionType.STARTGAME);

            default:
                break;
        }
    }

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
                        menuButtons.map((button) => (
                            <Tooltip title={button.label} placement="right">
                                <IconButton
                                    className={classes.iconButton}
                                    onClick={() => handleClickButton(button.action)}
                                >
                                    {getIcon(button.action, classes.icon)}
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

export default GameMenu;
