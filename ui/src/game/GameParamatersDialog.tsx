import React, { useState } from 'react';
import classnames from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import { Select, MenuItem, Typography } from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { MIN_VALUES, MAX_VALUES } from '../shared/util/consts';
import { GameType, MaxBuyinType, GameParameters } from '../shared/models/game/game';
import TextFieldWrap from '../reuseable/TextFieldWrap';
import RadioForm from '../reuseable/RadioForm';
import IconTooltip from '../reuseable/IconTooltip';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        dialog: {},
        tabCont: {
            display: 'flex',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
            flexDirection: 'column',
            height: '50vh',
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
        tabs: {
            backgroundColor: '#101010',
        },
        disabled: {
            pointerEvents: 'none',
            opacity: 0.65,
        },
    }),
);

function GameParamatersDialog(props) {
    const classes = useStyles();
    const { open, onSave, onCancel, gameParameters, disabled } = props;

    const [curGameParameters, SET_curGameParameters] = useState(gameParameters);
    const [tabValue, SET_tabValue] = React.useState('chips');

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
        timeBankReplenishIntervalMinutes,
        dynamicMaxBuyin,
        maxBuyinType,
    } = curGameParameters;

    function onPressEnter(event: any) {
        if (event.key === 'Enter') {
            event.preventDefault();
            onSave(curGameParameters);
        }
    }

    function setIntoGameParameters(field: keyof GameParameters, value) {
        SET_curGameParameters({ ...curGameParameters, [field]: value });
    }

    const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: string) => {
        SET_tabValue(newValue);
    };

    function generateChipsContent() {
        return (
            <div className={classes.tabCont}>
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
                    label={dynamicMaxBuyin ? 'Fixed Max Buyin' : 'Max Buyin'}
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
                    min={MIN_VALUES.BUY_IN}
                    max={MAX_VALUES.BUY_IN}
                />
                <div className={classes.field}>
                    <IconTooltip
                        className={classes.iconTip}
                        title="Enables maximum buyin amount to be computed during the game according to the sizes of other player's stacks. Players will always be able to buyin for at least the Fixed Max Buyin."
                        placement="left"
                    />
                    <RadioForm
                        label="Dynamic Max Buyin"
                        onChange={(event) => setIntoGameParameters('dynamicMaxBuyin', event.target.value === 'true')}
                        value={dynamicMaxBuyin + ''}
                        options={[
                            { label: 'Dynamic', value: 'true' },
                            { label: 'Fixed', value: 'false' },
                        ]}
                        radioGroupProps={{ row: true }}
                    />
                </div>

                <div className={classes.field}>
                    <IconTooltip
                        className={classes.iconTip}
                        title="Indicates how the maximum buyin amount is computed."
                        placement="left"
                    />
                    <FormControl className={classes.field}>
                        <InputLabel>Max Buyin Type</InputLabel>
                        <Select
                            value={dynamicMaxBuyin ? maxBuyinType : ''}
                            onChange={(event) =>
                                setIntoGameParameters('maxBuyinType', event.target.value as MaxBuyinType)
                            }
                            disabled={!dynamicMaxBuyin}
                        >
                            <MenuItem value={MaxBuyinType.TopStack}>Largest Stack</MenuItem>
                            <MenuItem value={MaxBuyinType.HalfTopStack}>Half of Largest Stack</MenuItem>
                            <MenuItem value={MaxBuyinType.SecondStack}>Second Largest Stack</MenuItem>
                            <MenuItem value={MaxBuyinType.AverageStack}>Average of All Stacks</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </div>
        );
    }

    function generateGamePlayContent() {
        return (
            <div className={classes.tabCont}>
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
                <div className={classes.field}>
                    <IconTooltip
                        className={classes.iconTip}
                        title="Every interval, a player receives one new time bank."
                        placement="left"
                    />
                    <TextFieldWrap
                        className={classes.field}
                        label="Refill Interval (minutes)"
                        onChange={(event) =>
                            setIntoGameParameters('timeBankReplenishIntervalMinutes', event.target.value)
                        }
                        value={timeBankReplenishIntervalMinutes}
                        type="number"
                        variant="standard"
                        disabled={!allowTimeBanks}
                        min={MIN_VALUES.TIME_BANK_REPLENISH_INTERVAL}
                        max={MAX_VALUES.TIME_BANK_REPLENISH_INTERVAL}
                    />
                </div>
            </div>
        );
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
                <Tabs value={tabValue} onChange={handleChangeTab} className={classes.tabs}>
                    <Tab label="Chips" value="chips" />
                    <Tab label="Gameplay" value="gameplay" />
                </Tabs>
                <div className={classnames({ [classes.disabled]: disabled })}>
                    {tabValue === 'chips' ? generateChipsContent() : null}
                    {tabValue === 'gameplay' ? generateGamePlayContent() : null}
                </div>
                {disabled ? <Typography>Only admin can change game settings.</Typography> : null}
            </DialogContent>
            <DialogActions>
                {disabled ? (
                    <Button onClick={onCancel}>Close</Button>
                ) : (
                    <>
                        <Button onClick={onCancel}>Cancel</Button>
                        <Button onClick={() => onSave(curGameParameters)} color="primary">
                            Save
                        </Button>{' '}
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default GameParamatersDialog;
