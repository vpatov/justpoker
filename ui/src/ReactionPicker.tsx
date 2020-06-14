import React from 'react';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { heroPlayerUUIDSelector, isHeroSeatedSelector } from './store/selectors';
import { WsServer } from './api/ws';
import { ClientActionType, ClientWsMessageRequest } from './shared/models/api/api';
import IconPicker from './reuseable/IconPicker';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import MoodIcon from '@material-ui/icons/Mood';
import Animoji from './Animoji';
import { AnimojiKeysDefaultRecentlyUsed, AnimojiKeys } from './shared/models/ui/assets';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import { useStickyState } from './utils';

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
            width: '32vmin',
            height: '50vh',
        },
    }),
);

const RECENTLY_USED_REACTIONS_KEY = 'jp-recent-reaction-keys';

function ReactionPicker(props) {
    const classes = useStyles();
    const [open, SET_open] = React.useState(false);
    const heroPlayerUUID = useSelector(heroPlayerUUIDSelector);
    const seated = useSelector(isHeroSeatedSelector);

    const [recentlyUsed, SET_recentlyUsed] = useStickyState(
        AnimojiKeysDefaultRecentlyUsed,
        RECENTLY_USED_REACTIONS_KEY,
    );

    const handleOpen = () => {
        SET_open(true);
    };

    const handleClose = () => {
        SET_open(false);
    };

    const onSelectReaction = (option) => {
        if (!recentlyUsed.includes(option.reaction)) {
            SET_recentlyUsed([...recentlyUsed.slice(1), option.reaction]);
        }
        sendServerAction(option.reaction);
        SET_open(false);
    };

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
        return Object.keys(AnimojiKeys).map((key, index) => ({
            icon: <Animoji key={`${key}${index}`} reaction={key} />,
            reaction: key,
        }));
    }

    if (!seated) return null;

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
                            onSelect={onSelectReaction}
                        />
                        {recentlyUsed.map((reaction) => (
                            <IconButton
                                key={reaction}
                                className={classes.iconButton}
                                onClick={() => onSelectReaction({ reaction })}
                            >
                                <Animoji reaction={reaction} />
                            </IconButton>
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
