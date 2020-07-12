import React, { ReactElement } from 'react';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

export interface SimpleDialogProps {
    open: boolean;
    nullWhenClosed?: boolean;
    title: string;
    contextText?: string;
    onCancel?: () => void;
    onConfirm?: () => void;
    contentComponent?: ReactElement;
}

function ConfirmationDialog(props: SimpleDialogProps) {
    const { onCancel, onConfirm, contextText, title, open, nullWhenClosed, contentComponent } = props;

    if (!open && nullWhenClosed) return null;
    return (
        <Dialog open={open}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {contentComponent ? contentComponent : null}
                {contextText ? <DialogContentText>{contextText}</DialogContentText> : null}
            </DialogContent>
            <DialogActions>
                {onCancel ? <Button onClick={onCancel}>Cancel</Button> : null}
                {onConfirm ? (
                    <Button onClick={onConfirm} color="primary" autoFocus>
                        Confirm
                    </Button>
                ) : null}
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmationDialog;
