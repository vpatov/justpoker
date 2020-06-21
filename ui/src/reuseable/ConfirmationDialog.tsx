import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

const useStyles = makeStyles({});

export interface SimpleDialogProps {
    open: boolean;
    nullWhenClosed?: boolean;
    title: string;
    contextText?: string;
    onCancel: () => void;
    onConfirm: () => void;
}

function ConfirmationDialog(props: SimpleDialogProps) {
    const classes = useStyles();
    const { onCancel, onConfirm, contextText, title, open, nullWhenClosed } = props;

    if (!open && nullWhenClosed) return null;
    return (
        <Dialog open={open}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{contextText}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm} color="primary" autoFocus>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmationDialog;
