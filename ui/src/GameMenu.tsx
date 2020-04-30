import React, { useState } from "react";
import classnames from "classnames";

import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Collapse from "@material-ui/core/Collapse";

import Paper from "@material-ui/core/Paper";
import AdminIcon from "@material-ui/icons/SupervisorAccount";
import SeatIcon from "@material-ui/icons/EventSeat";
import QuitIcon from "@material-ui/icons/Clear";
import StartIcon from "@material-ui/icons/PlayArrow";
import SettingsIcon from "@material-ui/icons/Settings";
import VolumeOnIcon from "@material-ui/icons/VolumeUp";
import MenuIcon from "@material-ui/icons/Menu";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        hoverArea: {
            zIndex: 5,
            position: "fixed",
            left: 0,
            top: 0,
            width: "5vw",
            height: "50vh",
        },
        root: {
            zIndex: 5,
            position: "fixed",
            left: 0,
            top: 0,
            margin: "2vmin",
            fontSize: "1vmin",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s ease-in-out",
            maxHeight: "5vmin",
            overflow: "hidden",
        },
        rootExpanded: {
            transition: "max-height 0.3s ease-in-out",
            maxHeight: "90vh",
        },

        tooltip: {
            fontSize: "1vmin",
            display: "flex",
        },
        iconButton: {
            height: "5vmin",
            width: "5vmin",
            borderRadius: "5%",
        },
        icon: {
            fontSize: "2.5vmin",
        },
    })
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
        { icon: <StartIcon className={classes.icon} />, name: "Start Game" },
        { icon: <SeatIcon className={classes.icon} />, name: "Sit Out" },
        { icon: <QuitIcon className={classes.icon} />, name: "Quit" },
        { icon: <VolumeOnIcon className={classes.icon} />, name: "Volume" },
        { icon: <SettingsIcon className={classes.icon} />, name: "Settings" },
        { icon: <AdminIcon className={classes.icon} />, name: "Admin" },
    ];

    return (
        <>
            <Paper
                elevation={4}
                className={classnames(classes.root, {
                    [classes.rootExpanded]: open,
                })}
                onMouseOver={handleOpen}
                onMouseLeave={handleClose}
            >
                {open ? (
                    actions.map((action) => (
                        <Tooltip title={action.name} placement="right">
                            <IconButton className={classes.iconButton}>
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
        </>
    );
}

export default Default;
