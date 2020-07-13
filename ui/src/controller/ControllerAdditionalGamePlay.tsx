import React, { useState } from 'react';

import { useSelector } from 'react-redux';
import { controllerSelector, selectGameParameters, globalGameStateSelector } from '../store/selectors';

import classnames from 'classnames';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';

import BuyChipsDialog from '../game/BuyChipsDialog';
import { WsServer } from '../api/ws';
import { ClientActionType, ClientWsMessageRequest, ClientStraddleRequest } from '../shared/models/api/api';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        additionalGamePlayTopButtons: {
            display: 'flex',
            alignItems: 'center',
        },
        postLoseButtonContainer: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
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
    }),
);

// provides the user with additional game play interactions:
// time bank, sit out next hand, straddle
function ControllerAdditionalGamePlay(props) {
    const classes = useStyles();
    const { rootClassName } = props;
    const { toAct, dealInNextHand, timeBanks, willStraddle } = useSelector(controllerSelector);
    const { allowStraddle, allowTimeBanks } = useSelector(selectGameParameters);
    const { isHeroAtTable, heroTotalChips } = useSelector(globalGameStateSelector);

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

    function generatePostLoseButtons() {
        if (heroTotalChips <= 0 && !dealInNextHand) {
            return (
                <div className={classes.postLoseButtonContainer}>
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

    return (
        <div className={rootClassName}>
            <BuyChipsDialog open={buyChipsDialogOpen} handleBuy={handleBuy} handleCancel={handleClose} />
            {generatePostLoseButtons()}
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
                    control={<Checkbox checked={willStraddle} onChange={onToggleStraddle} />}
                    label="Straddle"
                />
            ) : null}
            {isHeroAtTable ? (
                <FormControlLabel
                    className={classes.formControlLabel}
                    classes={{ label: classes.checkLabel }}
                    control={<Checkbox checked={!dealInNextHand} onChange={onToggleSitOutNextHand} />}
                    label="Sit Out Next Hand"
                />
            ) : null}
        </div>
    );
}

ControllerAdditionalGamePlay.displayName = 'ControllerAdditionalGamePlay';

export default ControllerAdditionalGamePlay;
