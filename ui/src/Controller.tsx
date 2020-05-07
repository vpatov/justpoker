import React, { useState, useEffect, Fragment } from 'react';
import classnames from 'classnames';
import { WsServer } from './api/ws';
import { useSelector } from 'react-redux';
import {
    controllerSelector,
    heroHandLabelSelector,
    allowStraddleSelector,
    heroPlayerTimerSelector,
    bettingRoundActionTypesToUnqueueSelector,
} from './store/selectors';
import TextFieldWrap from './reuseable/TextFieldWrap';
import ControllerTimer from './ControllerTimer';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';

import { ActionType, ClientWsMessageRequest, ClientStraddleRequest } from './shared/models/wsaction';
import { Typography } from '@material-ui/core';
import { BettingRoundActionType } from './shared/models/game';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'absolute',
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            color: 'white',
            ...theme.custom.CONTROLLER,
        },
        gameInfoCont: {
            marginLeft: '2vw',
            width: '20%',
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
            marginLeft: '2vw',
            marginRight: '2vw',
            width: '30%',
            float: 'right',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'flex-end',
        },
        betActionsCont: {
            marginRight: '2vw',
            height: '100%',
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
        },
        bettingCont: {
            marginRight: '2vmin',
            height: '100%',
            width: '80%',
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexWrap: 'wrap',
            flexDirection: 'column',
        },
        sizingButtonsCont: {
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
        },
        betInput: {
            paddingRight: 50,
            paddingTop: 25,
        },
        amounts: {
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-evenly',
        },
        betFieldButtonCont: {
            width: '100%',
            display: 'flex',
        },
        betTextField: {
            flexGrow: 1,
            width: '5vmin',
            marginRight: '1vmin',
        },
        betTextFieldInput: {
            fontSize: '1.4vmin',
            padding: '1vmin',
        },
        actionButton: {
            height: '40%',
            width: '10vmin',
            fontSize: '1.6vmin',
            marginRight: '0.8vmin',
        },
        timeBankButton: {
            margin: '0.5vmin',
            fontSize: '1.1vmin',
        },
        checkLabel: {
            fontSize: '1.1vmin',
        },
        incButton: {
            padding: 0,
            fontSize: '2vmin',
            fontWeight: 'bold',
        },
        incButtonLeft: {
            marginRight: '1vmin',
        },
        adminButton: {
            fontSize: '1.4vmin',
        },
        sizeButton: {
            margin: 6,
            fontSize: '1vmin',
        },
        handLabel: {
            marginTop: '2vmin',
            fontSize: '2vmin',
            color: theme.palette.primary.main,
        },
        toActLabel: {
            fontSize: '2vmin',
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

// conflicting with chat
// TODO either get rid of hotkeys and ensure
// chat isnt in focus..
/*
const KEY_ACTION_MAP = {
    [ActionType.BET]: "B",
    [ActionType.CHECK]: "K",
    [ActionType.CALL]: "A",
    [ActionType.FOLD]: "F",
};
*/

function ControllerComp(props: ControllerProps) {
    console.log('render controller');

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
    } = useSelector(controllerSelector);

    const heroHandLabel = useSelector(heroHandLabelSelector);
    const allowStraddle = useSelector(allowStraddleSelector);
    const bettingRoundActionTypesToUnqueue = useSelector(bettingRoundActionTypesToUnqueueSelector);

    const [betAmt, setBetAmt] = useState(0);
    const [queuedActionType, setQueuedActionType] = useState('');

    useEffect(() => {
        for (const actionType of bettingRoundActionTypesToUnqueue) {
            if (queuedActionType === actionType) {
                setQueuedActionType('');
                setBetAmt(0);
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

    function onClickActionButton(betActionType) {
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
    if (toAct && queuedActionType !== '') {
        sendBettingRoundAction(queuedActionType);
        setQueuedActionType('');
    }

    function sendBettingRoundAction(betActionType) {
        WsServer.send({
            actionType: ActionType.BETACTION,
            request: {
                type: betActionType,
                amount: Number(betAmt),
            } as ClientWsMessageRequest,
        });
        if (betActionType === BettingRoundActionType.BET) {
            changeBetAmount(0);
        }
    }

    function isBetValid() {
        if (0 < betAmt && betAmt < min) return true;
        return false;
    }

    function onToggleSitOutNextHand() {
        WsServer.send({
            actionType: dealInNextHand ? ActionType.SITOUT : ActionType.SITIN,
            request: {} as ClientWsMessageRequest,
        });
    }

    function onToggleStraddle() {
        WsServer.send({
            actionType: ActionType.SETPLAYERSTRADDLE,
            request: { willStraddle: !willStraddle } as ClientStraddleRequest as ClientWsMessageRequest,
        });
    }

    return (
        <div
            className={classnames(classes.root, className, {
                [classes.rootToAct]: toAct,
            })}
        >
            <div className={classes.gameInfoCont}>
                <Typography className={classes.handLabel}>{heroHandLabel}</Typography>
                {toAct ? <Typography className={classes.toActLabel}>{'☉ Your Turn'}</Typography> : null}
            </div>
            <div className={classes.sizeAndBetActionsCont}>
                <div className={classes.betActionsCont}>
                    {actionButtons.map((button) => {
                        return (
                            <Button
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
                <div className={classes.bettingCont}>
                    {sizingButtons.length > 0 ? (
                        <Fragment>
                            <div className={classes.betFieldButtonCont}>
                                <TextFieldWrap
                                    className={classes.betTextField}
                                    InputProps={{
                                        classes: {
                                            input: classes.betTextFieldInput,
                                        },
                                    }}
                                    onChange={(event) => setBetAmt(event.target.value)}
                                    min={0}
                                    max={max}
                                    value={betAmt}
                                    type="number"
                                    autoFocus={true}
                                    error={isBetValid()}
                                    helperText={isBetValid() ? `Minimum Bet is ${min}` : ''}
                                />
                                <div className={classes.incrementCont}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => changeBetAmount(betAmt - min)}
                                        className={classnames(classes.incButton, classes.incButtonLeft)}
                                    >
                                        -
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => changeBetAmount(betAmt + min)}
                                        className={classnames(classes.incButton)}
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>
                            <div className={classes.sizingButtonsCont}>
                                {sizingButtons.map((button) => (
                                    <Button
                                        variant="outlined"
                                        className={classes.sizeButton}
                                        onClick={(e) => changeBetAmount(button.value)}
                                    >
                                        {button.label}
                                    </Button>
                                ))}
                            </div>
                        </Fragment>
                    ) : null}
                </div>
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
                        control={<Checkbox className={classes.button} checked={willStraddle} onChange={onToggleStraddle} />}
                        label="Straddle"
                    />
                ) : null}

                {timeBanks !== undefined ? (
                    <Button
                        className={classes.timeBankButton}
                        variant="outlined"
                        onClick={() => null}
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
