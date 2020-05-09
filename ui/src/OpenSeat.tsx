import React, { useState, Fragment } from 'react';
import classnames from 'classnames';
import { WsServer } from './api/ws';
import { ActionType } from './shared/models/wsaction';
import TextFieldWrap from './reuseable/TextFieldWrap';

import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import Typography from '@material-ui/core/Typography';
import { ClientWsMessageRequest } from './shared/models/wsaction';
import { Dialog, DialogContent, DialogActions, Button } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '7vmin',
        height: '7vmin',
        border: `2px solid white`,
        backgroundColor: grey[800],
        color: 'white',
        '&:hover': {
            backgroundColor: grey[900],
        },
    },
    field: {
        marginTop: '2vmin',
        width: '35%',
    },
    sit: {
        fontSize: '1.3vmin',
    },
    dialogRoot: {},
    dialogContent: {
        height: '20vmin',
    },
}));

function OpenSeat(props) {
    const classes = useStyles();
    const { className, style, seatNumber } = props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [minBuyin, setMinBuyin] = useState(25);
    // TODO maxBuyin should be read from game parameters.
    // TODO when entering the buyin amount, the textbox adjusts it too quickly.
    // For instance, if the minimum is 25, and you want to buyin for 50, when you
    // type the first 5, the text box automatically changes it to 25.
    const [maxBuyin, setMaxBuyin] = useState(200);
    const [buyin, setBuyin] = useState(100);

    const dialogClose = () => {
        setDialogOpen(false);
    };

    function onClickSitDown() {
        setDialogOpen(true);
    }

    function onChangeBuyin(event: any) {
        setBuyin(event.target.value);
    }

    function invalidBuyin() {
        return buyin < minBuyin || buyin > maxBuyin;
    }

    function invalidName() {
        return name === '';
    }

    function formInvalid() {
        return invalidBuyin() || invalidName();
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

    function onPressEnter(event: any) {
        if (event.key === 'Enter' && !formInvalid()) {
            event.preventDefault();
            onSubmitSitDownForm();
        }
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
                onKeyPress={(event) => onPressEnter(event)}
            >
                <DialogContent className={classes.dialogContent}>
                    <TextFieldWrap
                        autoFocus
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                        onChange={(event) => setName(event.target.value)}
                        value={name}
                        maxChars={24}
                    />
                    <TextFieldWrap
                        type="number"
                        className={classes.field}
                        value={buyin}
                        label="Buy In"
                        onChange={onChangeBuyin}
                        inputProps={{
                            step: 1,
                        }}
                        max={maxBuyin}
                        error={invalidBuyin()}
                        helperText={invalidBuyin() ? `Min Buy In is ${minBuyin}` : ''}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={dialogClose}>Cancel</Button>
                    <Button disabled={formInvalid()} onClick={onSubmitSitDownForm} color="primary">
                        Sit Down
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default OpenSeat;
