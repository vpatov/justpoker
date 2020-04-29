import React, { Fragment } from "react";
import Player from "./Player";
import OpenSeat from "./OpenSeat";
import Bet from "./Bet";
import CommunityCards from "./CommunityCards";
import classnames from "classnames";
import { useSelector } from "react-redux";
import {
    tableSelector,
    heroIsSeatedSelector,
    playersSelector,
} from "./store/selectors";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const TABLE_HEIGHT = 50;
const TABLE_WIDTH = 80;

const PLAYER_HEIGHT = 64;
const PLAYER_WIDTH = 90;

const BET_HEIGHT = 35;
const BET_WIDTH = 62;

function positionToPlacement(width, height, index) {
    const xInc = width / 8;
    const yInc = height / 6;
    const dict = {
        0: { x: xInc * 2, y: 0 },
        1: { x: xInc * 6, y: 0 },
        2: { x: width, y: yInc * 2 },
        3: { x: width, y: yInc * 4 },
        4: { x: xInc * 6.5, y: yInc * 5.7 },
        5: { x: xInc * 4, y: height },
        6: { x: xInc * 1.5, y: yInc * 5.7 },
        7: { x: 0, y: yInc * 4 },
        8: { x: 0, y: yInc * 2 },
    };

    return dict[index];
}
const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    playersCont: {
        position: "absolute",
        height: `${PLAYER_HEIGHT}vmin`,
        width: `${PLAYER_WIDTH}vmin`,
    },
    betCont: {
        position: "absolute",
        height: `${BET_HEIGHT}vmin`,
        width: `${BET_WIDTH}vmin`,
    },
    table: {
        position: "absolute",
        height: `${TABLE_HEIGHT}vmin`,
        width: `${TABLE_WIDTH}vmin`,
        borderRadius: "30vmin",
        margin: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        ...theme.custom.TABLE,
        // transition: "transform 2s linear 0s",
        // "&:hover": {
        //   transform: "rotateX(720deg)",
        // },
    },
    spot: {
        position: "absolute",
        top: 0,
        left: 0,
        transform: "translateY(-50%) translateX(-50%)",
    },
    mainPot: {
        fontSize: "3vmin",
        position: "absolute",
        transform: "translateY(-10vh)",
        backgroundColor: "rgba(0,0,0,0.4)",
        color: "white",
        borderRadius: 40,
        padding: "1vmin 3vmin",
    },
    totalPot: {
        fontSize: "2vmin",
    },
}));

function Table(props) {
    console.log("render table");
    const classes = useStyles();
    const { className } = props;
    const heroIsSeated = useSelector(heroIsSeatedSelector);
    const { communityCards, spots, pot } = useSelector(tableSelector);
    const players = useSelector(playersSelector);

    function createSpotsAtTable() {
        const ans = [] as any;

        for (let index = 0; index < spots; index++) {
            const pPos = positionToPlacement(
                PLAYER_WIDTH,
                PLAYER_HEIGHT,
                index
            );

            const player = players.find((p) => p.position === index);
            if (player) {
                ans.push(
                    <Fragment>
                        <Player
                            player={player}
                            className={classes.spot}
                            style={{
                                top: `${pPos.y}vmin`,
                                left: `${pPos.x}vmin`,
                            }}
                        />
                    </Fragment>
                );
            } else if (!heroIsSeated) {
                ans.push(
                    <OpenSeat
                        key={index}
                        seatNumber={index}
                        className={classes.spot}
                        style={{
                            top: `${pPos.y}vmin`,
                            left: `${pPos.x}vmin`,
                        }}
                    />
                );
            } else {
                ans.push(null);
            }
        }
        return ans;
    }

    function createBetsAtTable() {
        const ans = [] as any;

        for (let index = 0; index < spots; index++) {
            const bPos = positionToPlacement(BET_WIDTH, BET_HEIGHT, index);

            const player = players.find((p) => p.position === index);
            if (player && player.bet) {
                ans.push(
                    <Bet
                        style={{
                            top: `${bPos.y}vmin`,
                            left: `${bPos.x}vmin`,
                            transform: "translateY(-50%) translateX(-50%)",
                        }}
                        amount={player.bet}
                    />
                );
            } else {
                ans.push(null);
            }
        }
        return ans;
    }
    return (
        <div className={classnames(classes.root, className)}>
            <div className={classnames(classes.table, "ani_table")}>
                <Typography
                    className={classes.mainPot}
                >{`${pot.toLocaleString()}`}</Typography>
                <CommunityCards communityCards={communityCards} />
            </div>

            <div className={classes.playersCont}>{createSpotsAtTable()}</div>
            <div className={classes.betCont}>{createBetsAtTable()}</div>
        </div>
    );
}

export default Table;
