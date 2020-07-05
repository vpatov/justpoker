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
import ControllerBetAction from './ControllerBetAction';
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
    const { toAct, dealInNextHand, timeBanks, willStraddle, playerPositionString } = useSelector(controllerSelector);
    const heroHandLabel = useSelector(heroHandLabelSelector);
    const { allowStraddle, allowTimeBanks } = useSelector(selectGameParameters);
    const { isSpectator, isHeroAtTable, heroTotalChips } = useSelector(globalGameStateSelector);

    const [buyChipsDialogOpen, setBuyinDialogOpen] = useState(false);

    const handleClose = () => {
        setBuyinDialogOpen(false);
    };

    const handleBuy = () => {
        setBuyinDialogOpen(false);
        sendSitMessage(false);
    };

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
            <ControllerBetAction />
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
