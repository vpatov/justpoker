import React, { useState, Fragment } from "react";
import classnames from "classnames";
import Hand from "./Hand";
import { WsServer } from "./api/ws";
import { ActionType } from "./shared/models/wsaction";

import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import EventSeatIcon from "@material-ui/icons/EventSeat";
import grey from "@material-ui/core/colors/grey";
import Typography from "@material-ui/core/Typography";
import { ClientWsMessageRequest } from "./shared/models/wsaction";
import {
    Dialog,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    Input,
} from "@material-ui/core";
import Slider from "@material-ui/core/Slider";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "7vmin",
        height: "7vmin",
        border: `2px solid white`,
        backgroundColor: grey[800],
        color: "white",
        "&:hover": {
            backgroundColor: grey[900],
        },
    },
    field: {
        width: "30%",
    },
    sit: {
        fontSize: "1.3vmin",
    },
    dialogRoot: {},
    dialogContent: {
        height: "20vmin",
    },
}));

function OpenSeat(props) {
    const classes = useStyles();
    const { className, style, seatNumber } = props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [minBuyin, setMinBuyin] = useState(25);
    const [maxBuyin, setMaxBuyin] = useState(200);
    const [buyin, setBuyin] = useState(100);

    const dialogClose = () => {
        setDialogOpen(false);
    };

    function onClickSitDown() {
        setDialogOpen(true);
    }

    function onChangeBuyin(event: any) {
        setBuyin(Number(event.target.value));
    }

    function handleSliderChange(event: any, newValue: any) {
        setBuyin(Number(newValue));
    }

    function invalidBuyin() {
        return buyin < minBuyin || buyin > maxBuyin;
    }

    function invalidName() {
        return name === "";
    }

    function onSubmitSitDownForm() {
        WsServer.send({
            actionType: ActionType.JOINTABLEANDSITDOWN,
            request: {
                name,
                buyin: Number(buyin),
                seatNumber: seatNumber,
            } as ClientWsMessageRequest,
        });
        setDialogOpen(false);
    }

    return (
        <Fragment>
            <IconButton
                color="primary"
                className={classnames(classes.root, className)}
                style={style}
                onClick={onClickSitDown}
            >
                <Typography className={classes.sit}>Sit Here</Typography>
            </IconButton>
            <Dialog
                open={dialogOpen}
                className={classes.dialogRoot}
                maxWidth="xs"
                fullWidth
            >
                <DialogContent className={classes.dialogContent}>
                    <TextField
                        autoFocus
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                        onChange={(event) => setName(event.target.value)}
                        value={name}
                    />
                    <Slider
                        value={buyin}
                        onChange={handleSliderChange}
                        min={minBuyin}
                        max={maxBuyin}
                        step={1}
                    />
                    <TextField
                        className={classes.field}
                        value={buyin}
                        label="Buy In"
                        onChange={onChangeBuyin}
                        inputProps={{
                            type: "number",
                            min: 25,
                            max: 200,
                            step: 1,
                        }}
                        error={invalidBuyin()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={dialogClose}>Cancel</Button>
                    <Button
                        disabled={invalidBuyin() || invalidName()}
                        onClick={onSubmitSitDownForm}
                        color="primary"
                    >
                        Sit Down
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default OpenSeat;
