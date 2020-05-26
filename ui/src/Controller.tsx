import React, { useState, useEffect, Fragment } from 'react';
import classnames from 'classnames';
import { WsServer } from './api/ws';
import { useSelector } from 'react-redux';
import {
    controllerSelector,
    heroHandLabelSelector,
    allowStraddleSelector,
    bettingRoundActionTypesToUnqueueSelector,
    isHeroSeatedSelector,
} from './store/selectors';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';

import { ClientActionType, ClientWsMessageRequest, ClientStraddleRequest } from './shared/models/dataCommunication';
import { Typography } from '@material-ui/core';
import { BettingRoundActionType } from './shared/models/game';

import ControllerWarningDialog from './ControllerWarningDialog';
import ControllerBetSizer from './ControllerBetSizer';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'absolute',
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            ...theme.custom.CONTROLLER,
        },
        gameInfoCont: {
            marginLeft: '2vw',
            width: '8vw',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
        },
        sizeAndBetActionsCont: {
            width: '50%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
        },
        adminButtonCont: {
            marginRight: '2vw',
            float: 'right',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'flex-end',
        },
        betActionsCont: {
            width: '50%',
            marginRight: '2vw',
            height: '100%',
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
        },
        actionButton: {
            height: '40%',
            width: '12vmin',
            fontSize: '1.6vmin',
            marginRight: '0.8vmin',
        },
        timeBankButton: {
            margin: '0.5vmin',
            fontSize: '1.1vmin',
        },
        checkLabel: {
            fontSize: '1.4vmin',
        },
        adminButton: {
            fontSize: '1.4vmin',
        },
        handLabel: {
            marginTop: '2vmin',
            fontSize: '1.8vmin',
            color: theme.palette.primary.main,
        },
        toActLabel: {
            fontSize: '1.8vmin',
            color: theme.palette.primary.main,
            animation: '$blinking 1.3s linear infinite;',
        },
        '@keyframes blinking': {
            '50%': {
                opacity: 0,
            },
        },
        ...theme.custom.ACTION_BUTTONS,
    }),
);

export interface ControllerProps {
    className?: string;
}

function ControllerComp(props: ControllerProps) {
    const classes = useStyles();
    const { className } = props;
    const {
        toAct,
        min,
        max,
        sizingButtons,
        bettingRoundActionButtons: actionButtons,
        dealInNextHand,
        timeBanks,
        willStraddle,
        showWarningOnFold,
    } = useSelector(controllerSelector);

    const heroHandLabel = useSelector(heroHandLabelSelector);
    const allowStraddle = useSelector(allowStraddleSelector);
    const bettingRoundActionTypesToUnqueue = useSelector(bettingRoundActionTypesToUnqueueSelector);
    const heroSeated = useSelector(isHeroSeatedSelector);

    const [betAmt, setBetAmt] = useState(0);
    const [queuedActionType, setQueuedActionType] = useState('');

    const [warning, setWarning] = useState(false);

    useEffect(() => {
        for (const actionType of bettingRoundActionTypesToUnqueue) {
            if (queuedActionType === actionType) {
                setQueuedActionType('');
                setBetAmt(0);
                break;
            }
        }
    }, [bettingRoundActionTypesToUnqueue]);

    const changeBetAmount = (newAmt) => {
        // parse string into int
        let intValue = parseInt(newAmt, 10);

        // if user tries to input non interger values set to current value
        if (Number.isNaN(intValue) || newAmt <= 0) {
            setBetAmt(0);
        } else {
            setBetAmt(Math.min(Math.floor(newAmt), max));
        }
        return;
    };

    function closeDialog() {
        setWarning(false);
    }

    function onConfirmDialog() {
        setWarning(false);
        performBettingRoundAction(BettingRoundActionType.FOLD);
    }

    function onClickActionButton(betActionType) {
        if (betActionType === BettingRoundActionType.FOLD && showWarningOnFold) {
            setWarning(true);
        } else {
            performBettingRoundAction(betActionType);
        }
    }

    function performBettingRoundAction(betActionType) {
        if (toAct) {
            sendBettingRoundAction(betActionType);
        } else {
            if (queuedActionType === betActionType) {
                setQueuedActionType('');
            } else {
                setQueuedActionType(betActionType);
            }
        }
    }

    function sendBettingRoundAction(betActionType) {
        WsServer.send({
            actionType: ClientActionType.BETACTION,
            request: {
                type: betActionType,
                amount: Number(betAmt),
            } as ClientWsMessageRequest,
        });
        changeBetAmount(0);
    }

    function onClickTimeBank() {
        WsServer.send({
            actionType: ClientActionType.USETIMEBANK,
            request: {} as ClientWsMessageRequest,
        });
    }

    function onToggleSitOutNextHand() {
        WsServer.send({
            actionType: dealInNextHand ? ClientActionType.SITOUT : ClientActionType.SITIN,
            request: {} as ClientWsMessageRequest,
        });
    }

    function onToggleStraddle() {
        WsServer.send({
            actionType: ClientActionType.SETPLAYERSTRADDLE,
            request: ({ willStraddle: !willStraddle } as ClientStraddleRequest) as ClientWsMessageRequest,
        });
    }

    if (toAct && queuedActionType !== '') {
        sendBettingRoundAction(queuedActionType);
        setQueuedActionType('');
    }

    return (
        <div
            className={classnames(classes.root, className, {
                [classes.rootToAct]: toAct,
            })}
        >
            <ControllerWarningDialog open={warning} handleClose={closeDialog} onConfirm={onConfirmDialog} />
            <div className={classes.gameInfoCont}>
                <Typography className={classes.handLabel}>{heroHandLabel}</Typography>
                {toAct ? <Typography className={classes.toActLabel}>{'☉ Your Turn'}</Typography> : null}
            </div>
            <div className={classes.sizeAndBetActionsCont}>
                <div className={classes.betActionsCont}>
                    {actionButtons.map((button) => {
                        return (
                            <Button
                                id={
                                    button.action === BettingRoundActionType.CHECK ||
                                    button.action === BettingRoundActionType.CALL
                                        ? `ID_CheckCallButton`
                                        : ''
                                }
                                variant="outlined"
                                className={classnames(classes.actionButton, classes[button.action], {
                                    [classes[`${button.action}_QUEUED`]]: button.action === queuedActionType,
                                })}
                                disabled={button.disabled}
                                onClick={() => onClickActionButton(button.action)}
                            >
                                {button.label}
                            </Button>
                        );
                    })}
                </div>
                <ControllerBetSizer
                    sizingButtons={sizingButtons}
                    min={min}
                    max={max}
                    value={betAmt}
                    onChange={(val) => changeBetAmount(val)}
                    onClickActionButton={onClickActionButton}
                />
            </div>
            <div className={classes.adminButtonCont}>
                <FormControlLabel
                    classes={{ label: classes.checkLabel }}
                    control={
                        <Checkbox
                            className={classes.button}
                            checked={!dealInNextHand}
                            onChange={onToggleSitOutNextHand}
                        />
                    }
                    label="Sit Out Next Hand"
                />
                {allowStraddle ? (
                    <FormControlLabel
                        classes={{ label: classes.checkLabel }}
                        control={
                            <Checkbox className={classes.button} checked={willStraddle} onChange={onToggleStraddle} />
                        }
                        label="Straddle"
                    />
                ) : null}
                {heroSeated ? (
                    <Button
                        className={classnames(classes.timeBankButton, 'ani_timeBank')}
                        variant="outlined"
                        onClick={() => onClickTimeBank()}
                        disabled={timeBanks === 0}
                    >
                        {`Time Bank (${timeBanks})`}
                    </Button>
                ) : null}
            </div>
        </div>
    );
}

export default ControllerComp;
