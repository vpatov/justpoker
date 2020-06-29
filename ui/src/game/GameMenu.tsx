import React from 'react';
import { useLocation } from 'react-router';
import { parseHTTPParams } from '../shared/util/util';
import queryString from 'query-string';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { selectMenuButtons, selectGameParameters, isHeroAdminSelector } from '../store/selectors';
import { WsServer } from '../api/ws';
import SettingsDialog from './SettingsDialog';
import { ClientActionType, UiActionType, ClientWsMessageRequest } from '../shared/models/api/api';

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
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';

import GameParamatersDialog from './GameParamatersDialog';
import ConfirmationDialog from '../reuseable/ConfirmationDialog';

import { GameParameters } from '../shared/models/game/game';
import BuyChipsDialog from './BuyChipsDialog';
import { MenuButton } from '../shared/models/ui/uiState';

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
            borderRadius: '5%',
        },
        icon: {
            fontSize: '2.5vmin',
        },
    }),
);

const ALWAYS_SHOW = [
    UiActionType.OPEN_ADD_CHIPS,
    UiActionType.USER_SETTINGS,
    ClientActionType.LEAVETABLE,
    ClientActionType.QUITGAME,
];

function GameMenu(props) {
    const { mute, SET_mute } = props;
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const menuButtons = useSelector(selectMenuButtons);
    const gameParameters = useSelector(selectGameParameters);
    const isHeroAdmin = useSelector(isHeroAdminSelector);

    const location = useLocation();

    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [gameParametersOpen, SET_gameParametersOpen] = React.useState(false);
    const [confirmationQuit, SET_confirmationQuit] = React.useState(false);

    const [buyChipsDialog, SET_buyChipsDialog] = React.useState(false);
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
            case ClientActionType.QUITGAME:
                SET_confirmationQuit(true);
                break;
            case UiActionType.OPEN_ADD_CHIPS:
                SET_buyChipsDialog(true);
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
            [ClientActionType.LEAVETABLE]: <DirectionsRunIcon className={iconClass} />,
            [ClientActionType.QUITGAME]: <QuitIcon className={iconClass} />,
            [ClientActionType.STOPGAME]: <StopIcon className={iconClass} />,
            [ClientActionType.STARTGAME]: <StartIcon className={iconClass} />,
            [UiActionType.OPEN_ADD_CHIPS]: <MonetizationOnIcon className={iconClass} />,
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

    let alwaysShowMenuButtons: MenuButton[] = [];
    let hiddenMenuButtons: MenuButton[] = [];
    menuButtons.forEach((button) => {
        if (ALWAYS_SHOW.includes(button.action)) {
            alwaysShowMenuButtons.push(button);
        } else {
            hiddenMenuButtons.push(button);
        }
    });

    function generateButtonsFromArray(buttons) {
        return buttons.map((button) => (
            <Tooltip key={button.label} title={button.label} placement="right">
                <IconButton className={classes.iconButton} onClick={() => handleClickButton(button.action)}>
                    {getIcon(button.action, classes.icon)}
                </IconButton>
            </Tooltip>
        ));
    }

    return (
        <>
            <div className={classes.hoverArea} onMouseOver={handleOpen} onMouseLeave={handleClose}>
                <Paper
                    elevation={4}
                    className={classnames(classes.root, {
                        [classes.rootExpanded]: open,
                    })}
                    style={open ? {} : { maxHeight: `${5 * alwaysShowMenuButtons.length}vmin` }}
                >
                    {open ? (
                        <>
                            {generateButtonsFromArray(alwaysShowMenuButtons)}
                            {generateButtonsFromArray(hiddenMenuButtons)}
                        </>
                    ) : (
                        generateButtonsFromArray(alwaysShowMenuButtons)
                    )}
                </Paper>
            </div>
            <SettingsDialog handleClose={handleSettingsClose} open={settingsOpen} />
            {gameParametersOpen ? (
                <GameParamatersDialog
                    open={gameParametersOpen}
                    gameParameters={gameParameters}
                    onCancel={() => SET_gameParametersOpen(false)}
                    onSave={onGameParamatersDialogSave}
                    disabled={!isHeroAdmin}
                />
            ) : null}
            {buyChipsDialog ? (
                <BuyChipsDialog
                    open={buyChipsDialog}
                    handleBuy={() => SET_buyChipsDialog(false)}
                    handleCancel={() => SET_buyChipsDialog(false)}
                />
            ) : null}
            <ConfirmationDialog
                title="Are you sure you want to quit?"
                contextText={'Quitting will remove you from the table and make you a spectator.'}
                open={confirmationQuit}
                onCancel={() => SET_confirmationQuit(false)}
                onConfirm={() => {
                    SET_confirmationQuit(false);
                    sendServerAction(ClientActionType.QUITGAME);
                }}
                nullWhenClosed
            />
        </>
    );
}

export default GameMenu;
