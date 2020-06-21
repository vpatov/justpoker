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
        note: {
            marginTop: 12,
            fontSize: 12,
        },
    }),
);

function BuyChipsDialog(props) {
    const classes = useStyles();
    const { open, handleBuy, handleCancel } = props;

    const { heroTotalChips, isHeroInHand } = useSelector(globalGameStateSelector);
    const { minBuyin, maxBuyin } = useSelector(selectGameParameters);
    const heroPlayerUUID = useSelector(heroPlayerUUIDSelector);
    const [chipAmt, SET_ChipAmt] = useState(computeMax());

    function onSubmit() {
        WsServer.sendBuyChipsMessage(heroPlayerUUID, chipAmt);
        handleBuy();
    }

    function computeMax() {
        return Math.max(maxBuyin - heroTotalChips, 0);
    }

    function computeMin() {
        return Math.max(minBuyin - heroTotalChips, 0);
    }

    function validBuy() {
        return chipAmt >= computeMin() && chipAmt <= computeMax() && chipAmt !== 0;
    }

    function onPressEnter(event: any) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (validBuy()) onSubmit();
        }
    }
    return (
        <Dialog open={open} maxWidth="sm" fullWidth onKeyPress={(event) => onPressEnter(event)}>
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
                    autoFocus
                />
                <Typography>{`Current Chips: ${heroTotalChips?.toLocaleString()}`}</Typography>
                {isHeroInHand ? (
                    <Typography className={classes.note}>
                        You are currently particpating in a hand. The chips will be added to your stack upon completion.
                        If you win the hand, chips will be added up to the amount indicated, but not exceeding the
                        maximum buyin.
                    </Typography>
                ) : null}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button onClick={onSubmit} color="primary" disabled={!validBuy()}>
                    Buy
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default BuyChipsDialog;
