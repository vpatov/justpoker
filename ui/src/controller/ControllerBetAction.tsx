import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { controllerSelector, selectGameParameters, bettingRoundActionTypesToUnqueueSelector } from '../store/selectors';

import Color from 'color';
import classnames from 'classnames';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import { BettingRoundActionType } from '../shared/models/game/betting';
import ControllerBetSizer from './ControllerBetSizer';
import ControllerWarningDialog from './ControllerWarningDialog';
import { SELENIUM_TAGS } from '../shared/models/test/seleniumTags';
import { useFocus } from '../utils';
import { WsServer } from '../api/ws';
import { ClientActionType, ClientWsMessageRequest } from '../shared/models/api/api';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        sizeAndBetActionsCont: {
            width: '65%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
        },
        betActionsCont: {
            width: '50%',
            marginRight: '2vw',
            height: '100%',
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
        },
        checkFoldButton: {
            fontSize: '1.6vmin',
            width: '100%',
            height: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        actionButton: {
            height: '58%',
            width: '16vmin',
            fontSize: '1.6vmin',
            marginRight: '0.8vmin',
        },
        buyBackButton: {
            height: '58%',
            width: '25vmin',
            fontSize: '1.6vmin',
            marginRight: '2vmin',
        },
        ...theme.custom.ACTION_BUTTONS,
        semiDisabledFold: {
            borderColor: Color(theme.custom.ACTION_BUTTONS.FOLD.borderColor).desaturate(0.7).darken(0.5).string(),
            color: Color(theme.custom.ACTION_BUTTONS.FOLD.color).desaturate(0.7).darken(0.5).string(),
        },
        semiDisabledBet: {
            borderColor: Color(theme.custom.ACTION_BUTTONS.BET.borderColor).desaturate(0.7).darken(0.5).string(),
            color: Color(theme.custom.ACTION_BUTTONS.BET.color).desaturate(0.7).darken(0.5).string(),
        },
    }),
);

// the ui which allow user to bet, checkc/call, and fold
// the presence of these buttons are driver by the server via bettingActionButtons property in controller
// conatins logic to queue bet actions when it is not users turn to act
function ControllerBetAction(props) {
    const classes = useStyles();
    const { rootClassName } = props;
    const { toAct, min, max, sizingButtons, bettingActionButtons, showWarningOnFold, amountToCall } = useSelector(
        controllerSelector,
    );
    const { bigBlind } = useSelector(selectGameParameters);
    const bettingRoundActionTypesToUnqueue = useSelector(bettingRoundActionTypesToUnqueueSelector);

    const [betAmt, setBetAmt] = useState(0);
    const [queuedActionType, setQueuedActionType] = useState('');
    const [warning, setWarning] = useState(false);
    const [betInputRef, setBetInputFocus] = useFocus();

    function closeDialog() {
        setWarning(false);
    }

    function onConfirmDialog() {
        setWarning(false);
        performBettingRoundAction(BettingRoundActionType.FOLD);
    }

    // if there is selected betAmt and min changes rest betAmt
    useEffect(() => {
        if (betAmt !== 0 && betAmt < min) {
            setBetAmt(0);
        }
    }, [min, setBetAmt]);

    useEffect(() => {
        for (const actionType of bettingRoundActionTypesToUnqueue) {
            if (actionType === BettingRoundActionType.CHECK && queuedActionType === BettingRoundActionType.CHECK_FOLD) {
                setQueuedActionType(BettingRoundActionType.FOLD);
                setBetAmt(0);
                break;
            } else if (queuedActionType === actionType) {
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

    if (toAct && queuedActionType !== '') {
        if (queuedActionType === BettingRoundActionType.CHECK_FOLD) {
            sendBettingRoundAction(BettingRoundActionType.CHECK);
        } else {
            sendBettingRoundAction(queuedActionType);
        }

        setQueuedActionType('');
    }

    function onClickSemiDisabledBet() {
        setBetInputFocus();
    }

    function generateBetActionButtons() {
        const buttons = [] as any;

        // FOLD BUTTON
        let button = bettingActionButtons[BettingRoundActionType.FOLD];
        if (button) {
            const { action, label, disabled } = button;
            buttons.push(
                <Button
                    key={action}
                    variant="outlined"
                    className={classnames(classes.actionButton, classes[action], {
                        [classes[`${action}_QUEUED`]]: action === queuedActionType,
                        [classes.semiDisabledFold]: showWarningOnFold,
                    })}
                    onClick={() => onClickActionButton(action)}
                    disabled={disabled}
                >
                    {label}
                </Button>,
            );
        }

        // CHECK/FOLD BUTTON
        button = bettingActionButtons[BettingRoundActionType.CHECK_FOLD];
        if (button) {
            const { label, disabled } = button;
            buttons.push(
                <ButtonGroup
                    key={BettingRoundActionType.CHECK_FOLD}
                    orientation="vertical"
                    className={classes.actionButton}
                    disabled={disabled}
                >
                    <Button
                        id={SELENIUM_TAGS.IDS.CHECK_CALL_BUTTON}
                        variant="outlined"
                        className={classnames(classes.checkFoldButton, classes[BettingRoundActionType.CHECK], {
                            [classes[`${BettingRoundActionType.CHECK}_QUEUED`]]:
                                BettingRoundActionType.CHECK === queuedActionType,
                        })}
                        onClick={() => onClickActionButton(BettingRoundActionType.CHECK)}
                    >
                        {label}
                    </Button>
                    <Button
                        id={SELENIUM_TAGS.IDS.CHECK_CALL_BUTTON}
                        variant="outlined"
                        className={classnames(classes.checkFoldButton, classes[BettingRoundActionType.CHECK], {
                            [classes[`${BettingRoundActionType.CHECK}_QUEUED`]]:
                                BettingRoundActionType.CHECK_FOLD === queuedActionType,
                        })}
                        onClick={() => onClickActionButton(BettingRoundActionType.CHECK_FOLD)}
                    >
                        CHECK FOLD
                    </Button>
                </ButtonGroup>,
            );
        }

        // CHECK BUTTON
        button = bettingActionButtons[BettingRoundActionType.CHECK];
        if (button) {
            const { action, label, disabled } = button;
            buttons.push(
                <Button
                    id={SELENIUM_TAGS.IDS.CHECK_CALL_BUTTON}
                    key={action}
                    variant="outlined"
                    className={classnames(classes.actionButton, classes[action], {
                        [classes[`${action}_QUEUED`]]: action === queuedActionType,
                    })}
                    onClick={() => onClickActionButton(action)}
                    disabled={disabled}
                >
                    {label}
                </Button>,
            );
        }

        // CALL BUTTON
        button = bettingActionButtons[BettingRoundActionType.CALL];
        if (button) {
            const { action, label, disabled } = button;
            buttons.push(
                <Button
                    id={SELENIUM_TAGS.IDS.CHECK_CALL_BUTTON}
                    key={action}
                    variant="outlined"
                    className={classnames(classes.actionButton, classes[action], {
                        [classes[`${action}_QUEUED`]]: action === queuedActionType,
                    })}
                    onClick={() => onClickActionButton(action)}
                    disabled={disabled}
                >
                    {`${label} ${amountToCall}`}
                </Button>,
            );
        }

        // BET BUTTON
        button = bettingActionButtons[BettingRoundActionType.BET];
        if (button) {
            const { action, label, disabled } = button;
            const betSemiDisabled = betAmt < min;
            buttons.push(
                <Button
                    key={action}
                    variant="outlined"
                    className={classnames(classes.actionButton, classes[action], {
                        [classes[`${action}_QUEUED`]]: action === queuedActionType,
                        [classes.semiDisabledBet]: betSemiDisabled,
                    })}
                    onClick={() => {
                        if (betSemiDisabled) {
                            onClickSemiDisabledBet();
                        } else {
                            onClickActionButton(action);
                        }
                    }}
                    disabled={disabled}
                >
                    {`${label}${betAmt ? ` ${betAmt}` : ''}`}
                </Button>,
            );
        }

        return <div className={classes.betActionsCont}>{buttons}</div>;
    }

    return (
        <div className={rootClassName}>
            <ControllerWarningDialog open={warning} handleClose={closeDialog} onConfirm={onConfirmDialog} />
            {generateBetActionButtons()}
            <ControllerBetSizer
                sizingButtons={sizingButtons}
                min={min}
                max={max}
                bigBlind={bigBlind}
                value={betAmt}
                onChange={(val) => changeBetAmount(val)}
                onClickActionButton={onClickActionButton}
                betInputRef={betInputRef}
            />
        </div>
    );
}

ControllerBetAction.displayName = 'ControllerBetAction';

export default ControllerBetAction;
