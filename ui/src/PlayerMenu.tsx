import React, { useState } from "react";

import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import AddChipDialog from "./AddChipDialog";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            right: "100%",
        },
    })
);

function PlayerMenu(props) {
    const classes = useStyles();
    const { anchorEl, handleClose, stack, name, uuid } = props;
    const [chipsDialog, setChipsDialog] = useState(false);

    const handleCloseDialog = () => {
        setChipsDialog(false);
        handleClose();
    };
    return (
        <Menu
            className={classes.root}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: "center", horizontal: "right" }}
        >
            <AddChipDialog
                open={chipsDialog}
                handleClose={handleCloseDialog}
                name={name}
                stack={stack}
                uuid={uuid}
            />
            <MenuItem onClick={() => setChipsDialog(true)}>
                Modify Chips
            </MenuItem>
            <MenuItem onClick={handleClose}>Boot Player</MenuItem>
            <MenuItem onClick={handleClose}>Mute</MenuItem>
        </Menu>
    );
}

export default PlayerMenu;
