import React, { useState } from "react";
import { } from "./utils";
import { withRouter } from "react-router-dom";
import get from "lodash/get";
import { createGame } from "./api/http";
import { MIN_VALUES, MAX_VALUES } from "./shared/util/consts"

import { makeStyles } from "@material-ui/core/styles";
import TextFieldWrap from "./reuseable/TextFieldWrap"
import Button from "@material-ui/core/Button";
import { Select, MenuItem } from "@material-ui/core";
import { GameType } from "./shared/models/game";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        border: "1px solid black",
        borderRadius: 12,
        width: "40%",
        alignItems: "center",
        padding: 12,
    },
    field: {
        width: 300,
        margin: 12,
    },
    button: {
        width: 300,
        margin: 24,
    },
}));


function MakeGame(props) {
    const classes = useStyles();
    const { history } = props;

    const [name, setName] = useState("DefaultPlayer");
    const [bigBlind, setBigBlind] = useState(2);
    const [smallBlind, setSmallBlind] = useState(1);
    const [maxBuyin, setMaxBuyin] = useState(200);
    const [timeToAct, setTimeToAct] = useState(30);
    const [password, setPassword] = useState("");
    const [gameType, setGameType] = useState(GameType.NLHOLDEM);

    function canCreate() {
        return true;
        if (name && bigBlind && smallBlind && maxBuyin) {
            return true;
        }
        return false;
    }

    const createSuccess = (response) => {
        const tableId = get(response, "data.tableId");
        history.push(`/game/${tableId}`);
    };

    const createFailure = (err) => {
        console.log(err);
    };
    
    // TODO use the NewGameForm interface
    function handleCreateGame() {
        const createReq = {
            name,
            bigBlind,
            smallBlind,
            maxBuyin,
            timeToAct,
            password,
            gameType,
        };
        createGame(createReq, createSuccess, createFailure);
    }

    return (
        <div className={classes.root}>
            <TextFieldWrap
                className={classes.field}
                label="Small Blind"
                variant="outlined"
                onChange={(event) => setSmallBlind(Number(event.target.value))}
                value={smallBlind}
                min={MIN_VALUES.SMALL_BLIND}
                max={MAX_VALUES.SMALL_BLIND}
                type="number"
            />
            <TextFieldWrap
                className={classes.field}
                label="Big Blind"
                variant="outlined"
                onChange={(event) => setBigBlind(Number(event.target.value))}
                value={bigBlind}
                min={MIN_VALUES.BIG_BLIND}
                max={MAX_VALUES.BIG_BLIND}
                type="number"
            />
            <TextFieldWrap
                className={classes.field}
                label="Buyin"
                variant="outlined"
                onChange={(event) => setMaxBuyin(Number(event.target.value))}
                value={maxBuyin}
                min={MIN_VALUES.BUY_IN}
                max={MAX_VALUES.BUY_IN}
                type="number"
            />
            <TextFieldWrap
                className={classes.field}
                label="Time To Act"
                variant="outlined"
                onChange={(event) => setTimeToAct(Number(event.target.value))}
                value={timeToAct}
                min={MIN_VALUES.TIME_TO_ACT}
                max={MAX_VALUES.TIME_TO_ACT}
                type="number"
            />
            <Select
                variant="outlined"
                className={classes.field}
                value={gameType}
                onChange={(event) => setGameType(event.target.value as GameType)}
            >
                <MenuItem value={GameType.NLHOLDEM}>No Limit Hold'em</MenuItem>
                <MenuItem value={GameType.PLOMAHA}>Pot Limit Omaha</MenuItem>
            </Select>
            <Button
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
    );
}

export default withRouter(MakeGame);
