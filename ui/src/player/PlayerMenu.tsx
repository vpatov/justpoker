import React, { useState } from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AddChipDialog from '../game/SetChipDialog';
import { WsServer } from '../api/ws';
import { useSelector } from 'react-redux';
import { isHeroAdminSelector, heroPlayerUUIDSelector } from '../store/selectors';
import { AvatarKeys } from '../shared/models/ui/assets';
import { IconButton } from '@material-ui/core';
import Avatar from '../reuseable/Avatar';
import ConfirmationDialog from '../reuseable/ConfirmationDialog';
import { AVATAR_LOCAL_STORAGE_KEY } from '../game/JoinGameDialog';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            right: '100%',
        },
        avatarIcon: {
            height: '5vmin',
            width: '5vmin',
        },
        avatarButton: {
            borderRadius: '5%',
        },
        pickerMenu: {},
    }),
);

function PlayerMenu(props) {
    const classes = useStyles();
    const { anchorEl, handleClose, setHeroRotation, virtualPositon, player } = props;
    const { stack, name, uuid, admin, quitting } = player;
    const [chipsDialog, setChipsDialog] = useState(false);
    const [avatarDialog, SET_avatarDialog] = useState(false);
    const isHeroAdmin = useSelector(isHeroAdminSelector);
    const heroPlayerUUID = useSelector(heroPlayerUUIDSelector);
    const isPlayerHero = heroPlayerUUID === uuid;
    const handleCloseDialog = () => {
        setChipsDialog(false);
        handleClose();
    };

    const handleSetRotation = () => {
        setHeroRotation(virtualPositon);
        handleClose();
    };

    const handleBootPlayer = () => {
        WsServer.sendBootPlayerMessage(uuid);
        handleClose();
    };

    const handleAddAdmin = () => {
        WsServer.sendAddAdminMessage(uuid);
        handleClose();
    };

    const handleRemoveAdmin = () => {
        WsServer.sendRemoveAdminMessage(uuid);
        handleClose();
    };

    const handleChangeAvatarMenu = () => {
        SET_avatarDialog(true);
    };

    const handleSelectNewAvatar = (key) => () => {
        WsServer.sendChangeAvatarMessage(uuid, key);
        window.localStorage.setItem(AVATAR_LOCAL_STORAGE_KEY, JSON.stringify(key));
        SET_avatarDialog(false);
    };

    function generateAvatarDialog() {
        return (
            <>
                {Object.keys(AvatarKeys).map((key, index) => (
                    <IconButton key={key} onClick={handleSelectNewAvatar(key)} className={classes.avatarButton}>
                        <Avatar avatarKey={key} className={classes.avatarIcon} />
                    </IconButton>
                ))}
            </>
        );
    }
    return (
        <Menu
            className={classes.root}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        >
            <AddChipDialog open={chipsDialog} handleClose={handleCloseDialog} name={name} stack={stack} uuid={uuid} />
            {isHeroAdmin ? <MenuItem onClick={() => setChipsDialog(true)}>Modify Chips</MenuItem> : null}
            {isHeroAdmin && !admin ? <MenuItem onClick={handleAddAdmin}>Make Admin</MenuItem> : null}
            {isHeroAdmin && isPlayerHero ? <MenuItem onClick={handleRemoveAdmin}>Remove as Admin</MenuItem> : null}
            {isHeroAdmin && !isPlayerHero && !quitting ? (
                <MenuItem onClick={handleBootPlayer}>Boot Player</MenuItem>
            ) : null}
            <MenuItem onClick={handleSetRotation}>Rotate Here</MenuItem>
            {isPlayerHero ? <MenuItem onClick={handleChangeAvatarMenu}>Change Avatar</MenuItem> : null}
            <ConfirmationDialog
                title="Change Avatar"
                contentComponent={generateAvatarDialog()}
                open={avatarDialog}
                onCancel={() => SET_avatarDialog(false)}
                nullWhenClosed
            />
            {/* <MenuItem onClick={handleClose}>Mute</MenuItem> */}
        </Menu>
    );
}

export default PlayerMenu;
