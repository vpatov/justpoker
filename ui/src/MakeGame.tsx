import React, { useState } from "react";
import { } from "./utils";
import { withRouter } from "react-router-dom";
import get from "lodash/get";
import { createGame } from "./api/http";

import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
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
    const [buyin, setBuyin] = useState(200);
    const [timeToAct, setTimeToAct] = useState(30);
    const [password, setPassword] = useState("");
    const [gameType, setGameType] = useState("NLHOLDEM");

    function canCreate() {
        return true;
        if (name && bigBlind && smallBlind && buyin) {
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
    function handleCreateGame() {
        const createReq = {
            name,
            bigBlind,
            smallBlind,
            buyin,
            timeToAct,
            password,
            gameType,
        };
        createGame(createReq, createSuccess, createFailure);
    }

    // setName("DefaultPlayer");
    // setBuyin(200);
    // setBigBlind(2);
    // setSmallBlind(1);

    return (
        <div className={classes.root}>
            {/* <TextField
        className={classes.field}
        label="Name"
        variant="outlined"
        onChange={(event) => setName(event.target.value)}
        value={name}
      /> */}
            {/* <Select
        variant="outlined"
        className={classes.field}
        value={gameType}
        onChange={(event) => setGameType(event.target.value as string)}
      >
        <MenuItem value={"NLHOLDEM"}>No Limit Hold'em</MenuItem>
      </Select> */}
            <TextField
                className={classes.field}
                label="Small Blind"
                variant="outlined"
                onChange={(event) => setSmallBlind(Number(event.target.value))}
                value={smallBlind}
                type="number"
            />
            <TextField
                className={classes.field}
                label="Big Blind"
                variant="outlined"
                onChange={(event) => setBigBlind(Number(event.target.value))}
                value={bigBlind}
                type="number"
            />
            <TextField
                className={classes.field}
                label="Buyin"
                variant="outlined"
                onChange={(event) => setBuyin(Number(event.target.value))}
                value={buyin}
                type="number"
            />
            <TextField
                className={classes.field}
                label="Time To Act"
                variant="outlined"
                onChange={(event) => setTimeToAct(Number(event.target.value))}
                value={timeToAct}
                type="number"
            />
            {/* <TextField
        className={classes.field}
        label="Password"
        variant="outlined"
        onChange={(event) => setPassword(event.target.value)}
        value={password}
      /> */}
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
