import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import { Typography } from '@material-ui/core';

import { WsServer } from './api/ws';
import { ClientActionType, ClientWsMessageRequest } from './shared/models/dataCommunication';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
        text: {
            marginBottom: 24,
        },
    }),
);

function ControllerWarningDialog(props) {
    const classes = useStyles();
    const { open, handleClose, onConfirm } = props;

    function onPressEnter(event: any) {
        if (event.key === 'Enter') {
            event.preventDefault();
            onConfirm();
        }
    }

    return (
        <Dialog open={open} maxWidth="sm" fullWidth onKeyPress={(event) => onPressEnter(event)}>
            <DialogTitle>{`Confirm Fold`}</DialogTitle>
            <DialogContent>
                <Typography className={classes.text}>
                    This is an unnecessary fold. Currently, you can stay in the hand at no cost by checking.
                </Typography>
                <Typography className={classes.text}>Are you sure?</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={onConfirm} color="primary">
                    Fold
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ControllerWarningDialog;
