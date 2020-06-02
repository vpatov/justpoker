import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import { createGame } from './api/http';
import { MIN_VALUES, MAX_VALUES } from './shared/util/consts';

import { makeStyles } from '@material-ui/core/styles';
import TextFieldWrap from './reuseable/TextFieldWrap';
import RadioForm from './reuseable/RadioForm';

import Button from '@material-ui/core/Button';
import { Select, MenuItem } from '@material-ui/core';
import { GameType, getDefaultGameParameters, GameParameters } from './shared/models/game';
import Collapse from '@material-ui/core/Collapse';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        border: '1px solid black',
        borderRadius: 12,
        width: '70%',
        maxWidth: '1000px',
        maxHeight: '900px',
        padding: 'min(24px, 2vmin)',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        overflowY: 'auto',
        flex: '1 1 500px',
        marginBottom: 'min(96px, 8vh)',
    },
    fieldCont: {
        minWidth: '200px',
        maxWidth: '300px',
    },
    field: {
        width: '100%',
        margin: '12px auto',
        color: 'white',
    },
    advancedFieldCont: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    advancedField: {
        flex: '1 1 200px',
        margin: '12px',
        color: 'white',
    },
    button: {
        width: '100%',
        margin: '12px 0',
    },
}));

const defaultParams = getDefaultGameParameters();

function MakeGame(props) {
    const classes = useStyles();
    const { history } = props;

    const [showAdvanced, SET_showAdvanced] = useState(false);

    const [bigBlind, setBigBlind] = useState(defaultParams.bigBlind);
    const [smallBlind, setSmallBlind] = useState(defaultParams.smallBlind);
    const [maxBuyin, setMaxBuyin] = useState(defaultParams.maxBuyin);
    const [timeToAct, setTimeToAct] = useState(defaultParams.timeToAct);
    const [gameType, setGameType] = useState(defaultParams.gameType);

    // advanced params
    const [maxPlayers, SET_maxPlayers] = useState(defaultParams.maxPlayers);
    const [allowStraddle, SET_allowStraddle] = useState(defaultParams.allowStraddle);
    const [canShowHeadsUp, SET_canShowHeadsUp] = useState(defaultParams.canShowHeadsUp);
    const [numberTimeBanks, SET_numberTimeBanks] = useState(defaultParams.numberTimeBanks);
    const [timeBankTime, SET_timeBankTime] = useState(defaultParams.timeBankTime);
    const [allowTimeBanks, SET_allowTimeBanks] = useState(defaultParams.allowTimeBanks);

    function canCreate() {
        return true;
    }

    const createSuccess = (response) => {
        const gameInstanceUUID = get(response, 'data.gameInstanceUUID');
        history.push(`/game?gameInstanceUUID=${gameInstanceUUID}`);
    };

    const createFailure = (err) => {
        console.log(err);
    };

    // TODO use the NewGameForm interface
    function handleCreateGame() {
        const gameParameters: GameParameters = {
            bigBlind,
            smallBlind,
            maxBuyin,
            timeToAct,
            gameType,
            maxPlayers,
            allowStraddle,
            canShowHeadsUp,
            numberTimeBanks,
            timeBankTime,
            allowTimeBanks,
        };
        const createReq = {
            gameParameters: gameParameters,
        };
        createGame(createReq, createSuccess, createFailure);
    }

    return (
        <div className={classes.root}>
            <div className={classes.fieldCont}>
                <TextFieldWrap
                    className={classes.field}
                    label="Small Blind"
                    variant="standard"
                    onChange={(event) => setSmallBlind(Number(event.target.value))}
                    value={smallBlind}
                    min={MIN_VALUES.SMALL_BLIND}
                    max={MAX_VALUES.SMALL_BLIND}
                    type="number"
                />
                <TextFieldWrap
                    className={classes.field}
                    label="Big Blind"
                    variant="standard"
                    onChange={(event) => setBigBlind(Number(event.target.value))}
                    value={bigBlind}
                    min={MIN_VALUES.BIG_BLIND}
                    max={MAX_VALUES.BIG_BLIND}
                    type="number"
                />
                <TextFieldWrap
                    className={classes.field}
                    label="Buyin"
                    variant="standard"
                    onChange={(event) => setMaxBuyin(Number(event.target.value))}
                    value={maxBuyin}
                    min={MIN_VALUES.BUY_IN}
                    max={MAX_VALUES.BUY_IN}
                    type="number"
                />
                <TextFieldWrap
                    className={classes.field}
                    label="Time To Act"
                    variant="standard"
                    onChange={(event) => setTimeToAct(Number(event.target.value))}
                    value={timeToAct}
                    min={MIN_VALUES.TIME_TO_ACT}
                    max={MAX_VALUES.TIME_TO_ACT}
                    type="number"
                />
                <Select
                    className={classes.field}
                    value={gameType}
                    onChange={(event) => setGameType(event.target.value as GameType)}
                >
                    <MenuItem value={GameType.NLHOLDEM}>No Limit Hold'em</MenuItem>
                    <MenuItem value={GameType.PLOMAHA}>Pot Limit Omaha</MenuItem>
                </Select>
                <Button className={classes.button} onClick={() => SET_showAdvanced(!showAdvanced)}>
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                </Button>
                <Button
                    id={'ID_CreateGameButton'}
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={!canCreate()}
                    onClick={handleCreateGame}
                >
                    Create Game
                </Button>
            </div>
            {showAdvanced ? (
                <Collapse in={showAdvanced} mountOnEnter>
                    <div className={classes.advancedFieldCont}>
                        <TextFieldWrap
                            className={classes.advancedField}
                            label="Max Players"
                            onChange={(event) => SET_maxPlayers(event.target.value)}
                            value={maxPlayers}
                            type="number"
                            variant="standard"
                            min={MIN_VALUES.MAX_PLAYERS}
                            max={MAX_VALUES.MAX_PLAYERS}
                        />
                        <RadioForm
                            className={classes.advancedField}
                            label="Allow Straddle"
                            onChange={(event) => SET_allowStraddle(event.target.value === 'true')}
                            value={allowStraddle + ''}
                            options={[
                                { label: 'Allow', value: 'true' },
                                { label: 'Disallow', value: 'false' },
                            ]}
                            radioGroupProps={{ row: true }}
                        />
                        <RadioForm
                            className={classes.advancedField}
                            label="Can Show Heads Up"
                            onChange={(event) => SET_canShowHeadsUp(event.target.value === 'true')}
                            value={canShowHeadsUp + ''}
                            options={[
                                { label: 'Can Show', value: 'true' },
                                { label: "Can't Show", value: 'false' },
                            ]}
                            radioGroupProps={{ row: true }}
                        />
                        <RadioForm
                            className={classes.advancedField}
                            label="Time Banks"
                            onChange={(event) => SET_allowTimeBanks(event.target.value === 'true')}
                            value={allowTimeBanks + ''}
                            options={[
                                { label: 'On', value: 'true' },
                                { label: 'Off', value: 'false' },
                            ]}
                            radioGroupProps={{ row: true }}
                        />
                        <TextFieldWrap
                            className={classes.advancedField}
                            label="Number of Time Banks"
                            onChange={(event) => SET_numberTimeBanks(event.target.value)}
                            value={numberTimeBanks}
                            type="number"
                            variant="standard"
                            disabled={!allowTimeBanks}
                            min={MIN_VALUES.NUMBER_TIME_BANKS}
                            max={MAX_VALUES.NUMBER_TIME_BANKS}
                        />
                        <TextFieldWrap
                            className={classes.advancedField}
                            label="Time Bank Time"
                            onChange={(event) => SET_timeBankTime(event.target.value)}
                            value={timeBankTime}
                            type="number"
                            variant="standard"
                            disabled={!allowTimeBanks}
                            min={MIN_VALUES.TIME_BANK_TIME}
                            max={MAX_VALUES.TIME_BANK_TIME}
                        />
                    </div>
                </Collapse>
            ) : null}
        </div>
    );
}

export default withRouter(MakeGame);
