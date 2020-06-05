import React from 'react';
import { useLocation } from 'react-router';
import { parseHTTPParams } from './shared/util/util';
import queryString from 'query-string';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { selectMenuButtons, selectGameParameters } from './store/selectors';
import { WsServer } from './api/ws';
import SettingsDialog from './SettingsDialog';
import { ClientActionType, UiActionType, ClientWsMessageRequest } from './shared/models/api';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import GameSettingsIcon from '@material-ui/icons/SettingsApplications';
import QuitIcon from '@material-ui/icons/Clear';
import StartIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import UserSettingsIcon from '@material-ui/icons/Person';
import VolumeOnIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeMute';
import MenuIcon from '@material-ui/icons/Menu';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';

import GameParamatersDialog from './GameParamatersDialog';
import { GameParameters } from './shared/models/game';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        hoverArea: {
            zIndex: 5,
            position: 'absolute',
            left: 0,
            top: 0,
            width: '7vw',
            height: '45vh',
        },
        root: {
            zIndex: 5,
            position: 'absolute',
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
            // height: '5vmin',
            // width: '5vmin',
            borderRadius: '5%',
        },
        icon: {
            fontSize: '2.5vmin',
        },
    }),
);

function GameMenu(props) {
    const { mute, SET_mute } = props;
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const menuButtons = useSelector(selectMenuButtons);
    const gameParameters = useSelector(selectGameParameters);
    const location = useLocation();

    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [gameParametersOpen, SET_gameParametersOpen] = React.useState(false);

    const handleSettingsOpen = () => {
        setSettingsOpen(true);
    };

    const handleSettingsClose = () => {
        setSettingsOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpenLedger = () => {
        const queryParams = parseHTTPParams(queryString.parseUrl(location.search));
        const gameInstanceUUID = queryParams.gameInstanceUUID || null;
        const stringifiedUrl = queryString.stringifyUrl({ url: '/ledger', query: { gameInstanceUUID } });
        window.open(stringifiedUrl, '_blank');
    };

    function handleClickButton(action) {
        switch (action) {
            case UiActionType.GAME_SETTINGS:
                SET_gameParametersOpen(true);
                break;
            case UiActionType.USER_SETTINGS:
                handleSettingsOpen();
                break;
            case UiActionType.VOLUME:
                SET_mute(!mute);
                break;
            case UiActionType.OPEN_LEDGER:
                handleOpenLedger();
                break;
            case ClientActionType.LEAVETABLE:
                sendServerAction(ClientActionType.LEAVETABLE);
                break;
            case ClientActionType.STARTGAME:
                sendServerAction(ClientActionType.STARTGAME);
                break;
            case ClientActionType.STOPGAME:
                sendServerAction(ClientActionType.STOPGAME);
                break;
            default:
                break;
        }
    }

    function getIcon(action, iconClass) {
        if (action === UiActionType.VOLUME) {
            if (mute) return <VolumeOffIcon className={iconClass} />;
            return <VolumeOnIcon className={iconClass} />;
        }
        const ACTION_TO_ICON = {
            [UiActionType.GAME_SETTINGS]: <GameSettingsIcon className={iconClass} />,
            [UiActionType.USER_SETTINGS]: <UserSettingsIcon className={iconClass} />,
            [UiActionType.OPEN_LEDGER]: <AccountBalanceIcon className={iconClass} />,
            [ClientActionType.LEAVETABLE]: <QuitIcon className={iconClass} />,
            [ClientActionType.STOPGAME]: <StopIcon className={iconClass} />,
            [ClientActionType.STARTGAME]: <StartIcon className={iconClass} />,
        };
        return ACTION_TO_ICON[action];
    }

    function sendServerAction(action) {
        WsServer.send({
            actionType: action,
            request: {} as ClientWsMessageRequest,
        });
    }

    const onGameParamatersDialogSave = (gameParameters: GameParameters) => {
        WsServer.send({
            actionType: ClientActionType.SETGAMEPARAMETERS,
            request: {
                gameParameters,
            } as ClientWsMessageRequest,
        });
        SET_gameParametersOpen(false);
    };

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
                            <Tooltip key={button.label} title={button.label} placement="right">
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
            <SettingsDialog handleClose={handleSettingsClose} open={settingsOpen} />
            <GameParamatersDialog
                open={gameParametersOpen}
                gameParameters={gameParameters}
                onCancel={() => SET_gameParametersOpen(false)}
                onSave={onGameParamatersDialogSave}
            />
        </>
    );
}

export default GameMenu;
