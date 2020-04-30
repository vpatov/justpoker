import React, { useState } from "react";

import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

import Paper from "@material-ui/core/Paper";
import AdminIcon from "@material-ui/icons/SupervisorAccount";
import SeatIcon from "@material-ui/icons/EventSeat";
import QuitIcon from "@material-ui/icons/Clear";
import StartIcon from "@material-ui/icons/PlayArrow";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            zIndex: 5,
            position: "fixed",
            left: 0,
            top: 0,
            margin: "2vmin",
            fontSize: "1vmin",
            display: "flex",
            flexDirection: "column",
            opacity: 0.4,
            transition: "opacity 0.2s ease-in-out",
            "&:hover": {
                opacity: 1,
            },
        },
        tooltip: {
            fontSize: "1vmin",
            display: "flex",
        },
        speedDialFab: {
            height: "2vmin",
            width: "2vmin",
            fontSize: "2vmin",
        },
    })
);

const actions = [
    { icon: <StartIcon />, name: "Start Game" },
    { icon: <SeatIcon />, name: "Sit Out" },
    { icon: <QuitIcon />, name: "Quit" },
    { icon: <AdminIcon />, name: "Admin" },
];

function Default(props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Paper className={classes.root}>
            {actions.map((action) => (
                <Tooltip title={action.name} placement="right">
                    <IconButton>{action.icon}</IconButton>
                </Tooltip>
            ))}
        </Paper>
    );
}

export default Default;
