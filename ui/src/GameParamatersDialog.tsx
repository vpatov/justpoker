import React, { useState } from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import { Select, MenuItem } from '@material-ui/core';

import { MIN_VALUES, MAX_VALUES } from './shared/util/consts';
import { GameType } from './shared/models/game';
import TextFieldWrap from './reuseable/TextFieldWrap';
import RadioForm from './reuseable/RadioForm';
import IconTooltip from './reuseable/IconTooltip';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        dialog: {},
        root: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            flexDirection: 'column',
            height: '100%',
        },

        field: {
            margin: '12px',
            color: 'white',
            width: 240,
            display: 'flex',
        },
        iconTip: {
            margin: '0px 12px',
            alignSelf: 'center',
        },
        button: {
            width: '100%',
        },
    }),
);

function GameParamatersDialog(props) {
    const classes = useStyles();
    const { open, onSave, onCancel, gameParameters } = props;

    const [curGameParameters, SET_curGameParameters] = useState(gameParameters);

    const {
        smallBlind,
        bigBlind,
        maxBuyin,
        timeToAct,
        gameType,
        maxPlayers,
        minBuyin,
        allowStraddle,
        canShowHeadsUp,
        numberTimeBanks,
        timeBankTime,
        allowTimeBanks,
    } = curGameParameters;

    function onPressEnter(event: any) {
        if (event.key === 'Enter') {
            event.preventDefault();
            onSave(curGameParameters);
        }
    }

    function setIntoGameParameters(field, value) {
        SET_curGameParameters({ ...curGameParameters, [field]: value });
    }

    return (
        <Dialog
            className={classes.dialog}
            open={open}
            maxWidth="md"
            fullWidth
            onKeyPress={(event) => onPressEnter(event)}
        >
            <DialogTitle>{`Game Settings`}</DialogTitle>
            <DialogContent>
                <div className={classes.root}>
                    <TextFieldWrap
                        className={classes.field}
                        label="Small Blind"
                        variant="standard"
                        onChange={(event) => setIntoGameParameters('smallBlind', event.target.value)}
                        value={smallBlind}
                        min={MIN_VALUES.SMALL_BLIND}
                        max={MAX_VALUES.SMALL_BLIND}
                        type="number"
                    />
                    <TextFieldWrap
                        className={classes.field}
                        label="Big Blind"
                        variant="standard"
                        onChange={(event) => setIntoGameParameters('bigBlind', event.target.value)}
                        value={bigBlind}
                        min={MIN_VALUES.BIG_BLIND}
                        max={MAX_VALUES.BIG_BLIND}
                        type="number"
                    />
                    <TextFieldWrap
                        className={classes.field}
                        label="Max Buyin"
                        variant="standard"
                        onChange={(event) => setIntoGameParameters('maxBuyin', event.target.value)}
                        value={maxBuyin}
                        min={MIN_VALUES.BUY_IN}
                        max={MAX_VALUES.BUY_IN}
                        type="number"
                    />
                    <TextFieldWrap
                        className={classes.field}
                        label="Min Buyin"
                        onChange={(event) => setIntoGameParameters('minBuyin', event.target.value)}
                        value={minBuyin}
                        type="number"
                        variant="standard"
                        min={0}
                        max={MAX_VALUES.BUY_IN}
                    />
                    <TextFieldWrap
                        className={classes.field}
                        label="Time To Act"
                        variant="standard"
                        onChange={(event) => setIntoGameParameters('timeToAct', event.target.value)}
                        value={timeToAct}
                        min={MIN_VALUES.TIME_TO_ACT}
                        max={MAX_VALUES.TIME_TO_ACT}
                        type="number"
                    />
                    <FormControl className={classes.field}>
                        <InputLabel>Game Type</InputLabel>
                        <Select
                            value={gameType}
                            onChange={(event) => setIntoGameParameters('gameType', event.target.value as GameType)}
                        >
                            <MenuItem value={GameType.NLHOLDEM}>No Limit Hold'em</MenuItem>
                            <MenuItem value={GameType.PLOMAHA}>Pot Limit Omaha</MenuItem>
                        </Select>
                    </FormControl>
                    <TextFieldWrap
                        className={classes.field}
                        label="Max Players"
                        onChange={(event) => setIntoGameParameters('maxPlayers', event.target.value)}
                        value={maxPlayers}
                        type="number"
                        variant="standard"
                        min={MIN_VALUES.MAX_PLAYERS}
                        max={MAX_VALUES.MAX_PLAYERS}
                    />

                    <div className={classes.field}>
                        <IconTooltip
                            className={classes.iconTip}
                            title="Gives players ability to straddle. The player to the left of the big blind bets twice the big blind before the cards are dealt."
                            placement="left"
                        />
                        <RadioForm
                            label="Allow Straddle"
                            onChange={(event) => setIntoGameParameters('allowStraddle', event.target.value === 'true')}
                            value={allowStraddle + ''}
                            options={[
                                { label: 'Allow', value: 'true' },
                                { label: 'Disallow', value: 'false' },
                            ]}
                            radioGroupProps={{ row: true }}
                        />
                    </div>
                    <div className={classes.field}>
                        <IconTooltip
                            className={classes.iconTip}
                            title="Gives players ability to show some or all of their hole cards once one vs one with another player."
                            placement="left"
                        />
                        <RadioForm
                            className={classes.field}
                            label="Can Show Heads Up"
                            onChange={(event) => setIntoGameParameters('canShowHeadsUp', event.target.value === 'true')}
                            value={canShowHeadsUp + ''}
                            options={[
                                { label: 'Can Show', value: 'true' },
                                { label: "Can't Show", value: 'false' },
                            ]}
                            radioGroupProps={{ row: true }}
                        />
                    </div>
                    <div className={classes.field}>
                        <IconTooltip
                            className={classes.iconTip}
                            title="Give players ability use a time bank which extends their time to act on that turn by a fixed amount."
                            placement="left"
                        />
                        <RadioForm
                            className={classes.field}
                            label="Time Banks"
                            onChange={(event) => setIntoGameParameters('allowTimeBanks', event.target.value === 'true')}
                            value={allowTimeBanks + ''}
                            options={[
                                { label: 'On', value: 'true' },
                                { label: 'Off', value: 'false' },
                            ]}
                            radioGroupProps={{ row: true }}
                        />
                    </div>
                    <div className={classes.field}>
                        <IconTooltip
                            className={classes.iconTip}
                            title="The number of time banks a player is given at buyin."
                            placement="left"
                        />
                        <TextFieldWrap
                            className={classes.field}
                            label="Number of Time Banks"
                            onChange={(event) => setIntoGameParameters('numberTimeBanks', event.target.value)}
                            value={numberTimeBanks}
                            type="number"
                            variant="standard"
                            disabled={!allowTimeBanks}
                            min={MIN_VALUES.NUMBER_TIME_BANKS}
                            max={MAX_VALUES.NUMBER_TIME_BANKS}
                        />
                    </div>
                    <div className={classes.field}>
                        <IconTooltip
                            className={classes.iconTip}
                            title="The number of seconds by which a player's time to act is extended after using a time bank."
                            placement="left"
                        />
                        <TextFieldWrap
                            className={classes.field}
                            label="Time Bank Seconds"
                            onChange={(event) => setIntoGameParameters('timeBankTime', event.target.value)}
                            value={timeBankTime}
                            type="number"
                            variant="standard"
                            disabled={!allowTimeBanks}
                            min={MIN_VALUES.TIME_BANK_TIME}
                            max={MAX_VALUES.TIME_BANK_TIME}
                        />
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSave(curGameParameters)} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default GameParamatersDialog;
