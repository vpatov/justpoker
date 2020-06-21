import React, { useState } from 'react';
import FieldWithMinMaxButtons from '../reuseable/FieldWithMinMaxButtons';
import { selectGameParameters, globalGameStateSelector, heroPlayerUUIDSelector } from '../store/selectors';
import { useSelector } from 'react-redux';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import { Typography } from '@material-ui/core';

import { WsServer } from '../api/ws';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        content: {},
        amtCont: {
            display: 'flex',
        },
        field: {
            marginBottom: 24,
        },
        minMaxButtonCont: {
            display: 'flex',
            flexDirection: 'column',
        },
        minMaxButton: {
            width: 150,
        },
    }),
);

function BuyChipsDialog(props) {
    const classes = useStyles();
    const { open, handleBuy, handleCancel } = props;

    const { heroTotalChips } = useSelector(globalGameStateSelector);
    const { minBuyin, maxBuyin } = useSelector(selectGameParameters);
    const heroPlayerUUID = useSelector(heroPlayerUUIDSelector);
    const [chipAmt, SET_ChipAmt] = useState(computeMax());
    const resultingChips = computeResultingChips();

    function onSubmit() {
        WsServer.sendSetChipsMessage(heroPlayerUUID, resultingChips);
        handleBuy();
    }

    function computeResultingChips() {
        return heroTotalChips + chipAmt;
    }

    function computeMax() {
        return maxBuyin - heroTotalChips;
    }

    function computeMin() {
        return Math.max(minBuyin - heroTotalChips, 0);
    }

    function validBuy() {
        return chipAmt >= computeMin() && chipAmt <= computeMax();
    }
    return (
        <Dialog open={open} maxWidth="sm" fullWidth>
            <DialogTitle>{`Buy Chips`}</DialogTitle>
            <DialogContent className={classes.content}>
                <FieldWithMinMaxButtons
                    className={classes.field}
                    label="Amount"
                    onChange={(event) => SET_ChipAmt(event.target.value)}
                    value={chipAmt}
                    min={computeMin()}
                    max={computeMax()}
                    type="number"
                />
                <Typography>{`Current Chips: ${heroTotalChips.toLocaleString()}`}</Typography>
                <Typography>{`Resulting Chips: ${resultingChips.toLocaleString()}`}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button onClick={onSubmit} color="primary" autoFocus disabled={!validBuy()}>
                    Buyin
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default BuyChipsDialog;
