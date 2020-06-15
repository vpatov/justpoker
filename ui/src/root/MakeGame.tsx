import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import { createGame } from '../api/http';
import { MIN_VALUES, MAX_VALUES } from '../shared/util/consts';

import { makeStyles } from '@material-ui/core/styles';
import TextFieldWrap from '../reuseable/TextFieldWrap';

import Button from '@material-ui/core/Button';
import { Select, MenuItem } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { GameType, getDefaultGameParameters, GameParameters } from '../shared/models/game/game';
import GameParamatersDialog from '../game/GameParamatersDialog';

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

    const [showAdvanced, SET_showAdvanced] = useState(false);
    const [gameParameters, SET_gameParameters] = useState(getDefaultGameParameters());
    const { smallBlind, bigBlind, maxBuyin, timeToAct, gameType } = gameParameters;

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

    return (
        <div className={classes.root}>
            <div className={classes.fieldCont}>
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
                    label="Time To Act"
                    variant="standard"
                    onChange={(event) => setIntoGameParameters('timeToAct', event.target.value)}
                    value={timeToAct}
                    min={MIN_VALUES.TIME_TO_ACT}
                    max={MAX_VALUES.TIME_TO_ACT}
                    type="number"
                />{' '}
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
                <Button className={classes.advButton} onClick={() => SET_showAdvanced(!showAdvanced)}>
                    Advanced Settings
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
    );
}

export default withRouter(MakeGame);
