import React, { useState } from 'react';
import TextFieldWrap from '../reuseable/TextFieldWrap';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { MAX_VALUES } from '../shared/util/consts';

import { Typography } from '@material-ui/core';

import { WsServer } from '../api/ws';

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
        warning: {
            marginTop: 12,
            fontSize: 12,
        },
    }),
);

function SetChipDialog(props) {
    const classes = useStyles();
    const { open, handleClose, name, stack, uuid } = props;
    const [chipAmt, setChipAmt] = useState(0);
    const [mode, setMode] = React.useState('Add');

    const resultingChips = computeResultingChips();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChipAmt(0);
        setMode((event.target as HTMLInputElement).value);
    };

    function onSubmit() {
        WsServer.sendSetChipsMessage(uuid, resultingChips);
        handleClose();
    }

    function canSubmit() {
        return resultingChips >= 0;
    }

    function computeResultingChips() {
        switch (mode) {
            case 'Add':
                return stack + chipAmt;
            case 'Subtract':
                return stack - chipAmt;
            case 'Set':
                return chipAmt;
            default:
                return 0;
        }
    }

    function getMax() {
        switch (mode) {
            case 'Add':
                return MAX_VALUES.PLAYER_STACK - stack;
            case 'Subtract':
                return stack;
            case 'Set':
                return MAX_VALUES.PLAYER_STACK;
            default:
                return 0;
        }
    }

    return (
        <Dialog open={open} maxWidth="sm" fullWidth>
            <DialogTitle>{`Modify ${name}'s Chips`}</DialogTitle>
            <DialogContent>
                <RadioGroup className={classes.radioGroup} value={mode} onChange={handleChange}>
                    <FormControlLabel value="Add" control={<Radio />} label="Add Chips" />
                    <FormControlLabel value="Subtract" control={<Radio />} label="Subtract Chips" />
                    <FormControlLabel value="Set" control={<Radio />} label="Set Chips" />
                </RadioGroup>
                <TextFieldWrap
                    className={classes.field}
                    label="Amount"
                    onChange={(event) => setChipAmt(parseInt(event.target.value))}
                    value={chipAmt}
                    min={0}
                    max={getMax()}
                    type="number"
                    variant="standard"
                    autoFocus
                />
                <Typography>{`Current Chips: ${stack.toLocaleString()}`}</Typography>
                <Typography>{`Resulting Chips: ${resultingChips.toLocaleString()}`}</Typography>
                <Typography className={classes.warning}>
                    {
                        'Warning: this action will take effect immediately and may impact the gameplay of the current hand. The change will be recorded in the ledger.'
                    }
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={onSubmit} disabled={!canSubmit()} color="primary" autoFocus>
                    {mode} Chips
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default SetChipDialog;
