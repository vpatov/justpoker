import React, { useState, useEffect } from 'react';
import get from 'lodash/get';
import { createGame, getCapacity } from '../api/http';
import { MIN_VALUES, MAX_VALUES } from '../shared/util/consts';

import { makeStyles } from '@material-ui/core/styles';
import TextFieldWrap from '../reuseable/TextFieldWrap';

import Button from '@material-ui/core/Button';
import { Select, MenuItem, Typography, Checkbox, FormControlLabel } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { GameType, getDefaultGameParameters, GameParameters } from '../shared/models/game/game';
import GameParamatersDialog from '../game/GameParamatersDialog';
import { SELENIUM_TAGS } from '../shared/models/test/seleniumTags';
import Animoji from '../reuseable/Animoji';
import { AnimojiKeys } from '../shared/models/ui/assets';
import { NOT_RELATIVE_THEME } from '../style/Theme';
import { ThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { withRouter } from 'react-router';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        border: '1px solid black',
        borderRadius: 12,
        width: '40%',
        maxWidth: '500px',
        maxHeight: '600px',
        padding: 'min(24px, 2vmin)',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        overflowY: 'auto',
        flex: '1 1 500px',
        marginTop: 12,
        marginBottom: 'min(96px, 8vh)',
        position: 'relative',
    },
    fieldCont: {
        maxWidth: '300px',
    },
    field: {
        width: '100%',
        margin: '12px auto',
        color: 'white',
    },
    checkLabel: {
        color: 'white',
    },
    animoji: {
        width: 100,
        height: 100,
    },
    capacityMessage: {
        fontSize: 26,
        textAlign: 'center',
        color: theme.palette.error.light,
    },
    button: {
        width: '100%',
        margin: '12px 0',
    },
    advButton: {
        margin: '12px',
        position: 'absolute',
        top: 0,
        right: 0,
    },
}));

function MakeGame(props) {
    const classes = useStyles();
    const { history } = props;

    const [areOverCapacity, SET_areOverCapacity] = useState();
    const [canCreate, SET_canCreate] = useState(false);
    const [showAdvanced, SET_showAdvanced] = useState(false);
    const [gameParameters, SET_gameParameters] = useState(getDefaultGameParameters());
    const { smallBlind, bigBlind, maxBuyin, timeToAct, gameType, useCents } = gameParameters;

    function generateCapacityMessage() {
        return (
            <div className={classes.root}>
                <Typography className={classes.capacityMessage}>
                    {`Our servers are currently over capacity.\nNo new games can be created. Please check back shortly!.`}{' '}
                </Typography>
                <Animoji reaction={AnimojiKeys.broken_heart} animated className={classes.animoji} />
            </div>
        );
    }
    function errorSB() {
        if (smallBlind > bigBlind) return true;
        if (smallBlind < MIN_VALUES.SMALL_BLIND) return true;
        return false;
    }

    function errorBB() {
        if (bigBlind < MIN_VALUES.SMALL_BLIND) return true;
        return false;
    }

    function errorMaxBuy() {
        if (maxBuyin < MIN_VALUES.BUY_IN) return true;
        return false;
    }

    function errorTimeToAct() {
        if (timeToAct < MIN_VALUES.TIME_TO_ACT) return true;
        return false;
    }

    function createButtonEnabled() {
        return !errorSB() && !errorBB() && !errorMaxBuy() && !errorTimeToAct() && canCreate;
    }

    useEffect(() => {
        getCapacity(capacitySuccess, capacityFailure);
    }, []);

    const capacitySuccess = (response) => {
        const areOverCapacity = get(response, 'data.areOverCapacity', true);
        if (!areOverCapacity) SET_canCreate(true);
        SET_areOverCapacity(areOverCapacity);
    };

    const capacityFailure = (err) => {
        console.log(err);
    };

    const createSuccess = (response) => {
        const gameInstanceUUID = get(response, 'data.gameInstanceUUID');
        history.push(`/table/${gameInstanceUUID}`);
    };

    const createFailure = (err) => {
        console.error(err);
    };

    function setIntoGameParameters(field, value) {
        SET_gameParameters({ ...gameParameters, [field]: value });
    }

    const onGameParamatersDialogSave = (gameParameters: GameParameters) => {
        SET_gameParameters(gameParameters);
        SET_showAdvanced(false);
    };

    function handleCreateGame() {
        const createReq = {
            gameParameters: gameParameters,
        };
        createGame(createReq, createSuccess, createFailure);
    }

    if (areOverCapacity === true) return generateCapacityMessage();
    if (canCreate === false) return <div className={classes.root} />; // prevents flash of normal screen

    return (
        <ThemeProvider theme={createMuiTheme(NOT_RELATIVE_THEME)}>
            <div className={classes.root}>
                <div className={classes.fieldCont}>
                    <TextFieldWrap
                        className={classes.field}
                        label="Small Blind"
                        variant="standard"
                        onChange={(event) => setIntoGameParameters('smallBlind', event.target.value)}
                        value={smallBlind}
                        max={MAX_VALUES.SMALL_BLIND}
                        type="number"
                        error={errorSB()}
                        divideBy100={useCents}
                    />
                    <TextFieldWrap
                        className={classes.field}
                        label="Big Blind"
                        variant="standard"
                        onChange={(event) => setIntoGameParameters('bigBlind', event.target.value)}
                        value={bigBlind}
                        max={MAX_VALUES.BIG_BLIND}
                        type="number"
                        error={errorBB()}
                        divideBy100={useCents}
                    />
                    <TextFieldWrap
                        className={classes.field}
                        label="Max Buyin"
                        variant="standard"
                        onChange={(event) => setIntoGameParameters('maxBuyin', event.target.value)}
                        value={maxBuyin}
                        max={MAX_VALUES.BUY_IN}
                        type="number"
                        error={errorMaxBuy()}
                        divideBy100={useCents}
                    />
                    <TextFieldWrap
                        className={classes.field}
                        label="Time To Act (seconds)"
                        variant="standard"
                        onChange={(event) => setIntoGameParameters('timeToAct', event.target.value)}
                        value={timeToAct}
                        max={MAX_VALUES.TIME_TO_ACT}
                        type="number"
                        error={errorTimeToAct()}
                    />
                    <FormControl className={classes.field}>
                        <InputLabel>Game Type</InputLabel>
                        <Select
                            className={classes.field}
                            value={gameType}
                            onChange={(event) => setIntoGameParameters('gameType', event.target.value as GameType)}
                        >
                            <MenuItem value={GameType.NLHOLDEM}>No Limit Hold'em</MenuItem>
                            <MenuItem value={GameType.PLOMAHA}>Pot Limit Omaha</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        className={classes.checkLabel}
                        control={
                            <Checkbox
                                checked={useCents}
                                onChange={() => setIntoGameParameters('useCents', !useCents)}
                                color="primary"
                            />
                        }
                        label="Use Cent Denominations"
                    />
                    <Button className={classes.advButton} onClick={() => SET_showAdvanced(!showAdvanced)}>
                        Advanced Settings
                    </Button>

                    <Button
                        id={SELENIUM_TAGS.IDS.CREATE_GAME_BUTTON}
                        className={classes.button}
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={!createButtonEnabled()}
                        onClick={handleCreateGame}
                    >
                        Create Game
                    </Button>
                    {showAdvanced ? (
                        <GameParamatersDialog
                            open={showAdvanced}
                            gameParameters={gameParameters}
                            onCancel={() => SET_showAdvanced(false)}
                            onSave={onGameParamatersDialogSave}
                        />
                    ) : null}
                </div>
            </div>
        </ThemeProvider>
    );
}

export default withRouter(MakeGame);
