import React from 'react';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { heroPlayerUUIDSelector } from './store/selectors';
import { WsServer } from './api/ws';
import { ClientActionType, UiActionType, ClientWsMessageRequest } from './shared/models/api';
import IconPicker from './reuseable/IconPicker';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import MoodIcon from '@material-ui/icons/Mood';
import { ReactionTrigger } from './shared/models/animationState';
import Animoji from './Animoji';
import { AvatarIds } from './shared/models/assets';
import Avatar from './Avatar';
import MoreHoriz from '@material-ui/icons/MoreHoriz';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        hoverArea: {
            zIndex: 5,
            position: 'absolute',
            left: 0,
            bottom: '11%',
            minWidth: '8vw',
            minHeight: '45vh',
        },
        root: {
            zIndex: 5,
            position: 'absolute',
            left: 0,
            bottom: '11%',
            margin: '2vmin',
            fontSize: '1vmin',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.2s ease-in-out',
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
        avatarIcon: {
            height: '5vmin',
            width: '5vmin',
        },
        pickerMenu: {
            width: '30vmin',
        },
    }),
);

function ReactionPicker(props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const heroPlayerUUID = useSelector(heroPlayerUUIDSelector);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    function handleClickButton(reaction) {
        sendServerAction(reaction);
    }

    function sendServerAction(reaction) {
        WsServer.send({
            actionType: ClientActionType.REACTION,
            request: {
                reaction: reaction,
                playerUUID: heroPlayerUUID,
            } as ClientWsMessageRequest,
        });
    }

    function getPickerOptions() {
        return Object.keys(AvatarIds).map((key, index) => ({
            icon: <Avatar key={`${key}${index}`} avatarKey={key} className={classes.avatarIcon} />,
            avatarKey: key,
        }));
    }

    return (
        <div className={classes.hoverArea} onMouseOver={handleOpen} onMouseLeave={handleClose}>
            <Paper
                elevation={4}
                className={classnames(classes.root, {
                    [classes.rootExpanded]: open,
                })}
            >
                {open ? (
                    <>
                        <IconPicker
                            options={getPickerOptions()}
                            paperClass={classes.pickerMenu}
                            placement="right"
                            initIcon={<MoreHoriz />}
                        />
                        {Object.values(ReactionTrigger).map((reaction) => (
                            <Tooltip title={reaction} placement="right">
                                <IconButton className={classes.iconButton} onClick={() => handleClickButton(reaction)}>
                                    <Animoji reaction={reaction} />
                                </IconButton>
                            </Tooltip>
                        ))}
                    </>
                ) : (
                    <IconButton className={classes.iconButton}>
                        <MoodIcon className={classes.icon} />
                    </IconButton>
                )}
            </Paper>
        </div>
    );
}

export default ReactionPicker;
