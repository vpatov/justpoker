import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import { Typography } from '@material-ui/core';

import { WsServer } from './api/ws';
import { ActionType, ClientWsMessageRequest } from './shared/models/wsaction';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
        radioGroup: {
            display: 'flex',
            flexDirection: 'row',
        },
        field: {
            marginTop: 24,
            marginBottom: 24,
        },
    }),
);

function ControllerWarningDialog(props) {
    const classes = useStyles();
    const { open, handleClose, actionType, message } = props;

    function onSubmit() {
        WsServer.send({
            actionType: actionType,
            request: {} as ClientWsMessageRequest,
        });
        handleClose();
    }

    return (
        <Dialog open={open} maxWidth="sm" fullWidth>
            <DialogTitle>{`Confirm Action`}</DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={onSubmit} color="primary">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ControllerWarningDialog;
