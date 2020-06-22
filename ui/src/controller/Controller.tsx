import React, { useState, useEffect, Fragment } from 'react';
import classnames from 'classnames';
import { WsServer } from '../api/ws';
import { useSelector } from 'react-redux';
import {
    controllerSelector,
    heroHandLabelSelector,
    selectGameParameters,
    bettingRoundActionTypesToUnqueueSelector,
    globalGameStateSelector,
    heroPlayerUUIDSelector,
} from '../store/selectors';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';

import { ClientActionType, ClientWsMessageRequest, ClientStraddleRequest } from '../shared/models/api/api';
import { Typography, Tooltip } from '@material-ui/core';
import { BettingRoundActionType } from '../shared/models/game/betting';

import ControllerSpectator from './ControllerSpectator';
import ControllerWarningDialog from './ControllerWarningDialog';
import ControllerBetSizer from './ControllerBetSizer';
import ControllerShowCard from './ControllerShowCard';
import BuyChipsDialog from '../game/BuyChipsDialog';
import { BettingRoundActionButton } from '../shared/models/ui/uiState';
import red from '@material-ui/core/colors/red';
import Color from 'color';
import { SELENIUM_TAGS } from '../shared/models/test/seleniumTags';
import { grey } from '@material-ui/core/colors';

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
            backgroundColor: 'rgba(0, 0, 0, 0.42)',
            background: 'unset',
            transition: 'background-color 0.25s linear',
        },
        rootToAct: {
            transition: 'background-color 0.25s linear',
            backgroundColor: grey[900],
            background: `linear-gradient(rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%);`,
        },
        gameInfoCont: {
            marginLeft: '2vw',
            height: '100%',
            width: '20%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'self-start',
            justifyContent: 'center',
        },
        sizeAndBetActionsCont: {
            width: '60%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
        },
        additionalGamePlayCont: {
            width: '20%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginRight: '2vw',
        },
        additionalGamePlayTopButtons: {
            display: 'flex',
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
            textAlign: 'right',
        },
        formControlLabel: {
            margin: 0,
        },

        adminButton: {
            fontSize: '1.4vmin',
        },
        handLabel: {
            fontSize: '1.8vmin',
            color: theme.palette.primary.main,
        },
        totalChips: {
            fontSize: '1.8vmin',
            color: theme.palette.primary.main,
        },
        handLabelSmaller: {
            fontSize: '1.6vmin',
        },
        playerPositonString: {
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
        semiDisabledFold: {
            borderColor: Color(theme.custom.ACTION_BUTTONS.FOLD.borderColor).desaturate(0.7).darken(0.5).string(),
            color: Color(theme.custom.ACTION_BUTTONS.FOLD.color).desaturate(0.7).darken(0.5).string(),
        },
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
        showCardButtons,
        dealInNextHand,
        timeBanks,
        willStraddle,
        showWarningOnFold,
        callAmount,
        playerPositionString,
    } = useSelector(controllerSelector);

    const heroHandLabel = useSelector(heroHandLabelSelector);
    const { allowStraddle, allowTimeBanks } = useSelector(selectGameParameters);
    const bettingRoundActionTypesToUnqueue = useSelector(bettingRoundActionTypesToUnqueueSelector);
    const { isSpectator, isHeroAtTable, heroTotalChips } = useSelector(globalGameStateSelector);
    const [buyChipsDialogOpen, setBuyinDialogOpen] = useState(false);

    const heroPlayerUUID = useSelector(heroPlayerUUIDSelector);

    const [betAmt, setBetAmt] = useState(0);
    const [queuedActionType, setQueuedActionType] = useState('');

    const [warning, setWarning] = useState(false);

    // if there is selected betAmt and min changes rest betAmt
    useEffect(() => {
        if (betAmt !== 0 && betAmt < min) {
            setBetAmt(0);
        }
    }, [min, setBetAmt]);

    useEffect(() => {
        for (const actionType of bettingRoundActionTypesToUnqueue) {
            if (queuedActionType === actionType) {
                setQueuedActionType('');
                setBetAmt(0);
                break;
            }
        }
    }, [bettingRoundActionTypesToUnqueue]);

    const handleClose = () => {
        setBuyinDialogOpen(false);
    };

    const handleBuy = () => {
        setBuyinDialogOpen(false);
        // TODO make it such that user is automatically sitting in
        // as soon as they buyin through this dialog
        sendSitMessage(false);
    };

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

    function sendSitMessage(dealInNextHand: boolean) {
        WsServer.send({
            actionType: dealInNextHand ? ClientActionType.SITOUT : ClientActionType.SITIN,
            request: {} as ClientWsMessageRequest,
        });
    }

    function onToggleSitOutNextHand() {
        if (heroTotalChips <= 0) setBuyinDialogOpen(true);
        else sendSitMessage(dealInNextHand);
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

    function getBetActionButtonText(button: BettingRoundActionButton): string {
        switch (button.action) {
            case BettingRoundActionType.CALL:
                return `${button.label} ${callAmount || ''}`;
            case BettingRoundActionType.BET:
                return `${button.label} ${betAmt || ''}`;
            case BettingRoundActionType.CHECK:
                return button.label;
            case BettingRoundActionType.FOLD:
                return button.label;

            default:
                return button.label;
        }
    }

    if (isSpectator)
        return (
            <ControllerSpectator
                className={classnames(classes.root, className, {
                    [classes.rootToAct]: toAct,
                })}
            />
        );

    return (
        <div
            className={classnames(classes.root, className, {
                [classes.rootToAct]: toAct,
            })}
            id={SELENIUM_TAGS.IDS.CONTROLLER_ROOT}
        >
            <ControllerWarningDialog open={warning} handleClose={closeDialog} onConfirm={onConfirmDialog} />
            <BuyChipsDialog open={buyChipsDialogOpen} handleBuy={handleBuy} handleCancel={handleClose} />
            <div className={classes.gameInfoCont}>
                {!isHeroAtTable ? (
                    <Tooltip title="Your current total chips." placement="right">
                        <Typography
                            className={classes.totalChips}
                        >{`Chips: ${heroTotalChips.toLocaleString()}`}</Typography>
                    </Tooltip>
                ) : null}
                {heroHandLabel ? (
                    <Tooltip title="Your current best hand." placement="right">
                        <Typography
                            className={classnames(classes.handLabel, {
                                [classes.handLabelSmaller]: heroHandLabel.length > 22,
                            })}
                        >
                            {heroHandLabel}
                        </Typography>
                    </Tooltip>
                ) : null}
                {playerPositionString ? (
                    <Tooltip title="Your position at the table relative to the dealer." placement="right">
                        <Typography className={classes.playerPositonString}>{playerPositionString}</Typography>
                    </Tooltip>
                ) : null}
            </div>
            <div className={classes.sizeAndBetActionsCont}>
                <div className={classes.betActionsCont}>
                    {actionButtons.map((button) => {
                        return (
                            <Button
                                id={
                                    button.action === BettingRoundActionType.CHECK ||
                                    button.action === BettingRoundActionType.CALL
                                        ? `${SELENIUM_TAGS.IDS.CHECK_CALL_BUTTON}`
                                        : ''
                                }
                                variant="outlined"
                                className={classnames(classes.actionButton, classes[button.action], {
                                    [classes[`${button.action}_QUEUED`]]: button.action === queuedActionType,
                                    [classes.semiDisabledFold]:
                                        button.action === BettingRoundActionType.FOLD && showWarningOnFold,
                                })}
                                disabled={
                                    button.disabled || (button.action === BettingRoundActionType.BET && betAmt < min)
                                }
                                onClick={() => onClickActionButton(button.action)}
                            >
                                {getBetActionButtonText(button)}
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

            <div className={classes.additionalGamePlayCont}>
                <div className={classes.additionalGamePlayTopButtons}>
                    {showCardButtons?.length ? (
                        <ControllerShowCard showCardButtons={showCardButtons} heroPlayerUUID={heroPlayerUUID} />
                    ) : null}
                    {isHeroAtTable && allowTimeBanks ? (
                        <Button
                            className={classnames(classes.timeBankButton, 'ani_timeBank')}
                            variant="outlined"
                            onClick={() => onClickTimeBank()}
                            disabled={timeBanks === 0 || !toAct}
                        >
                            {`Time Bank (${timeBanks})`}
                        </Button>
                    ) : null}
                </div>
                {allowStraddle ? (
                    <FormControlLabel
                        className={classes.formControlLabel}
                        classes={{ label: classes.checkLabel }}
                        control={
                            <Checkbox className={classes.button} checked={willStraddle} onChange={onToggleStraddle} />
                        }
                        label="Straddle"
                    />
                ) : null}
                <FormControlLabel
                    className={classes.formControlLabel}
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
            </div>
        </div>
    );
}

export default ControllerComp;
