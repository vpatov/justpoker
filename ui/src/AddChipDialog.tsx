import React, { useState } from "react";

import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { Typography } from "@material-ui/core";

import { WsServer } from "./api/ws";
import { ActionType, ClientWsMessageRequest } from "./shared/models/wsaction";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
        radioGroup: {
            display: "flex",
            flexDirection: "row",
        },
        field: {
            marginTop: 24,
            marginBottom: 24,
        },
    })
);

function AddChipDialog(props) {
    const classes = useStyles();
    const { open, handleClose, name, stack, uuid } = props;
    const [chipAmt, setChipAmt] = useState(0);
    const [mode, setMode] = React.useState("Add");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMode((event.target as HTMLInputElement).value);
    };

    function onSubmit(action) {
        WsServer.send({
            actionType: action,
            request: (action === ActionType.ADDCHIPS
                ? { chipAmount: chipAmt }
                : {}) as ClientWsMessageRequest,
        });
    }

    function computeResultingChips() {
        switch (mode) {
            case "Add":
                return stack + chipAmt;
            case "Subtract":
                return stack - chipAmt;
            case "Set":
                return chipAmt;
            default:
                return 0;
        }
    }

    return (
        <Dialog open={open} maxWidth="sm" fullWidth>
            <DialogTitle>{`Modify ${name}'s Chips`}</DialogTitle>
            <DialogContent>
                <RadioGroup
                    className={classes.radioGroup}
                    value={mode}
                    onChange={handleChange}
                >
                    <FormControlLabel
                        value="Add"
                        control={<Radio />}
                        label="Add Chips"
                    />
                    <FormControlLabel
                        value="Subtract"
                        control={<Radio />}
                        label="Subtract Chips"
                    />
                    <FormControlLabel
                        value="Set"
                        control={<Radio />}
                        label="Set Chips"
                    />
                </RadioGroup>
                <TextField
                    className={classes.field}
                    label="Amount"
                    onChange={(event) =>
                        setChipAmt(parseInt(event.target.value))
                    }
                    value={chipAmt}
                    type="number"
                    variant="outlined"
                />
                <Typography>{`Current Chips: ${stack.toLocaleString()}`}</Typography>
                <Typography>{`Resulting Chips: ${computeResultingChips().toLocaleString()}`}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleClose} color="primary" autoFocus>
                    {mode} Chips
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddChipDialog;
