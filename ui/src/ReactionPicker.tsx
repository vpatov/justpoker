import React from 'react';
import { parseHTTPParams } from './shared/util/util';
import queryString from 'query-string';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { heroPlayerUUIDSelector } from './store/selectors';
import { WsServer } from './api/ws';
import { ClientActionType, UiActionType, ClientWsMessageRequest } from './shared/models/api';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import EmojiEmotionsIcon from '@material-ui/icons/Mood';
import { AniReaction } from './shared/models/uiState';
import Animoji from './Animoji';
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        hoverArea: {
            zIndex: 5,
            position: 'absolute',
            left: 0,
            bottom: '11%',
            width: '7vw',
            height: '45vh',
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

    return (
        <div className={classes.hoverArea} onMouseOver={handleOpen} onMouseLeave={handleClose}>
            <Paper
                elevation={4}
                className={classnames(classes.root, {
                    [classes.rootExpanded]: open,
                })}
            >
                {open ? (
                    Object.values(AniReaction).map((reaction) => (
                        <Tooltip title={reaction} placement="right">
                            <IconButton className={classes.iconButton} onClick={() => handleClickButton(AniReaction)}>
                                <Animoji reaction={reaction} />
                            </IconButton>
                        </Tooltip>
                    ))
                ) : (
                    <IconButton className={classes.iconButton}>
                        <EmojiEmotionsIcon className={classes.icon} />
                    </IconButton>
                )}
            </Paper>
        </div>
    );
}

export default ReactionPicker;
