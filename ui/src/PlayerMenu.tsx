import React, { useState } from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AddChipDialog from './AddChipDialog';
import { WsServer } from './api/ws';
import { useSelector } from 'react-redux';
import { isHeroAdminSelector, heroPlayerUUIDSelector } from './store/selectors';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            right: '100%',
        },
    }),
);

function PlayerMenu(props) {
    const classes = useStyles();
    const { anchorEl, handleClose, stack, name, uuid, setHeroRotation, virtualPositon } = props;
    const [chipsDialog, setChipsDialog] = useState(false);
    const isHeroAdmin = useSelector(isHeroAdminSelector);
    const heroPlayerUUID = useSelector(heroPlayerUUIDSelector);

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
            {(isHeroAdmin && heroPlayerUUID !== uuid) ? <MenuItem onClick={handleBootPlayer}>Boot Player</MenuItem> : null}
            <MenuItem onClick={handleSetRotation}>Rotate Here</MenuItem>
            <MenuItem onClick={handleClose}>Mute</MenuItem>
        </Menu>
    );
}

export default PlayerMenu;
