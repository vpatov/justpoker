import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { WsServer } from '../api/ws';
import { useSelector } from 'react-redux';
import {
    controllerSelector,
    heroHandLabelSelector,
    selectGameParameters,
    bettingRoundActionTypesToUnqueueSelector,
    globalGameStateSelector,
} from '../store/selectors';
import { useFocus } from '../utils';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';

import { ClientActionType, ClientWsMessageRequest, ClientStraddleRequest } from '../shared/models/api/api';
import { Typography, Tooltip, ButtonGroup } from '@material-ui/core';
import { BettingRoundActionType } from '../shared/models/game/betting';

import ControllerSpectator from './ControllerSpectator';
import ControllerWarningDialog from './ControllerWarningDialog';
import ControllerBetSizer from './ControllerBetSizer';
import BuyChipsDialog from '../game/BuyChipsDialog';
import Color from 'color';
import { SELENIUM_TAGS } from '../shared/models/test/seleniumTags';
import { grey } from '@material-ui/core/colors';
import ControllerGameInfo from './ControllerGameInfo';

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
            backgroundColor: grey[900],
            background: `linear-gradient(rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%);`,
        },
        gameInfoCont: {
            marginLeft: '2vw',
            height: '100%',
            width: '15%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'self-start',
            justifyContent: 'center',
        },
        sizeAndBetActionsCont: {
            width: '65%',
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
        semiDisabledBet: {
            borderColor: Color(theme.custom.ACTION_BUTTONS.BET.borderColor).desaturate(0.7).darken(0.5).string(),
            color: Color(theme.custom.ACTION_BUTTONS.BET.color).desaturate(0.7).darken(0.5).string(),
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
        bettingActionButtons,
        dealInNextHand,
        timeBanks,
        willStraddle,
        showWarningOnFold,
        amountToCall,
        playerPositionString,
    } = useSelector(controllerSelector);
    const heroHandLabel = useSelector(heroHandLabelSelector);
    const { allowStraddle, allowTimeBanks, bigBlind } = useSelector(selectGameParameters);
    const bettingRoundActionTypesToUnqueue = useSelector(bettingRoundActionTypesToUnqueueSelector);
    const { isSpectator, isHeroAtTable, heroTotalChips } = useSelector(globalGameStateSelector);

    const [buyChipsDialogOpen, setBuyinDialogOpen] = useState(false);
    const [betAmt, setBetAmt] = useState(0);
    const [queuedActionType, setQueuedActionType] = useState('');
    const [warning, setWarning] = useState(false);
    const [betInputRef, setBetInputFocus] = useFocus();

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

    const handleClose = () => {
        setBuyinDialogOpen(false);
    };

    const handleBuy = () => {
        setBuyinDialogOpen(false);
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
            const { action, label, disabled } = button;
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

        return buttons;
    }

    function generatePostBustButtons() {
        if (heroTotalChips <= 0 && !dealInNextHand) {
            return (
                <div className={classes.betActionsCont}>
                    <Button
                        variant="outlined"
                        className={classes.buyBackButton}
                        onClick={() => {
                            WsServer.sendLeaveTableMessage();
                        }}
                    >
                        Leave Table
                    </Button>
                    <Button
                        variant="contained"
                        className={classes.buyBackButton}
                        onClick={() => {
                            setBuyinDialogOpen(true);
                        }}
                        color="primary"
                    >
                        Buy Back
                    </Button>
                </div>
            );
        }
        return null;
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
            {/* Dialogs */}
            <ControllerWarningDialog open={warning} handleClose={closeDialog} onConfirm={onConfirmDialog} />
            <BuyChipsDialog open={buyChipsDialogOpen} handleBuy={handleBuy} handleCancel={handleClose} />
            {/* Left-Most Game Info */}
            <ControllerGameInfo
                rootClassName={classes.gameInfoCont}
                isHeroAtTable={isHeroAtTable}
                heroTotalChips={heroTotalChips}
                heroHandLabel={heroHandLabel}
                playerPositionString={playerPositionString}
            />
            {/* Middle Betting Console */}
            <div className={classes.sizeAndBetActionsCont}>
                <div className={classes.betActionsCont}>{generateBetActionButtons()}</div>
                {generatePostBustButtons()}
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

            {/* Right-Most Game Play Buttons */}
            <div className={classes.additionalGamePlayCont}>
                <div className={classes.additionalGamePlayTopButtons}>
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
                {isHeroAtTable ? (
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
                ) : null}
            </div>
        </div>
    );
}

export default ControllerComp;
