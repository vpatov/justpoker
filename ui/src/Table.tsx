import React, { Fragment, useState } from 'react';
import findIndex from 'lodash/findIndex';
import Player from './Player';
import OpenSeat from './OpenSeat';
import Bet from './Bet';
import CommunityCards from './CommunityCards';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { tableSelector, playersSelector, globalGameStateSelector } from './store/selectors';
import { ActionType, ClientWsMessageRequest } from './shared/models/wsaction';
import { WsServer } from './api/ws';

import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';

const TABLE_HEIGHT = 45;
const TABLE_WIDTH = 75;

const PLAYER_HEIGHT = 64;
const PLAYER_WIDTH = 90;

const BET_HEIGHT = 35;
const BET_WIDTH = 62;

const HERO_DEFAULT_ROTATION = 5;

function positionToPlacement(width, height, index, offset) {
    const virtualIndex = mod(index + offset - 1, 9);
    const xInc = width / 8;
    const yInc = height / 6;
    const dict = {
        0: { x: xInc * 2, y: 0 },
        1: { x: xInc * 6, y: 0 },
        2: { x: width, y: yInc * 2 },
        3: { x: width, y: yInc * 4 },
        4: { x: xInc * 6.5, y: yInc * 5.7 },
        5: { x: xInc * 4, y: yInc * 5.85 },
        6: { x: xInc * 1.5, y: yInc * 5.7 },
        7: { x: 0, y: yInc * 4 },
        8: { x: 0, y: yInc * 2 },
    };

    return dict[virtualIndex];
}
const useStyles = makeStyles((theme) => ({
    root: {
        transform: 'translateY(-0%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playersCont: {
        position: 'absolute',
        height: `${PLAYER_HEIGHT}vmin`,
        width: `${PLAYER_WIDTH}vmin`,
    },
    betCont: {
        position: 'absolute',
        height: `${BET_HEIGHT}vmin`,
        width: `${BET_WIDTH}vmin`,
    },
    table: {
        position: 'absolute',
        height: `${TABLE_HEIGHT}vmin`,
        width: `${TABLE_WIDTH}vmin`,
        borderRadius: '30vmin',
        margin: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        ...theme.custom.TABLE,
    },
    spot: {
        position: 'absolute',
        top: 0,
        left: 0,
        transform: 'translateY(-50%) translateX(-50%)',
        // transition: 'all 0.4s ease-in-out',
    },
    mainPot: {
        fontSize: '2.6vmin',
        position: 'absolute',
        top: '22%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        color: 'white',
        borderRadius: 40,
        padding: '0.6vmin 3vmin',
    },
    fullPot: {
        borderRadius: '0.5vmin',
        zIndex: 5,
        padding: '0.5vmin 0.8vmin',
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: 'white',
        top: '-8%',
        position: 'absolute',
        fontSize: '1vmin',
    },
    startGame: {
        zIndex: 5,
        fontSize: '4vmin',
    },
}));

function mod(n, m) {
    return ((n % m) + m) % m;
}

function Table(props) {
    const classes = useStyles();
    const { className } = props;
    const { canStartGame, heroIsSeated, gameStarted } = useSelector(globalGameStateSelector);
    const { communityCards, spots, pot, fullPot } = useSelector(tableSelector);
    const players = useSelector(playersSelector);
    const [heroRotation, setHeroRotation] = useState(HERO_DEFAULT_ROTATION);

    const heroPosition = players.find((p) => Boolean(p.hero))?.position || 0;
    const offset = heroRotation - heroPosition + 1;

    function createSpotsAtTable() {
        const ans = [] as any;

        for (let index = 0; index < spots; index++) {
            const pPos = positionToPlacement(PLAYER_WIDTH, PLAYER_HEIGHT, index, offset);
            const player = players.find((p) => p.position === index);

            if (player) {
                ans.push(
                    <Fragment>
                        <Player
                            key={index}
                            setHeroRotation={(r) => {
                                setHeroRotation(r);
                            }}
                            virtualPositon={mod(index + offset - 1, 9)}
                            player={player}
                            className={classes.spot}
                            style={{
                                top: `${pPos.y}vmin`,
                                left: `${pPos.x}vmin`,
                            }}
                        />
                    </Fragment>,
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
                    />,
                );
            } else {
                ans.push(null);
            }
        }
        return ans;
    }

    function onClickStartGame() {
        sendServerAction(ActionType.STARTGAME);
    }

    function sendServerAction(action) {
        WsServer.send({
            actionType: action,
            request: {} as ClientWsMessageRequest,
        });
    }

    function createBetsAtTable() {
        const ans = [] as any;

        for (let index = 0; index < spots; index++) {
            const bPos = positionToPlacement(BET_WIDTH, BET_HEIGHT, index, offset);
            const player = players.find((p) => p.position === index);
            if (player && player.bet) {
                ans.push(
                    <Bet
                        style={{
                            top: `${bPos.y}vmin`,
                            left: `${bPos.x}vmin`,
                            transform: 'translateY(-50%) translateX(-50%)',
                        }}
                        amount={player.bet}
                    />,
                );
            } else {
                ans.push(null);
            }
        }
        return ans;
    }
    return (
        <div className={classnames(classes.root, className)}>
            <div className={classnames(classes.table, 'ani_table')}>
                {canStartGame ? (
                    <Button className={classes.startGame} color="primary" variant="outlined" onClick={onClickStartGame}>
                        Start Game
                    </Button>
                ) : null}
                {gameStarted ? (
                    <>
                        <Tooltip placement="top" title="Current main pot plus all commited bets by every player.">
                            <Typography
                                className={classes.fullPot}
                            >{`Full Pot: ${fullPot.toLocaleString()}`}</Typography>
                        </Tooltip>
                        <Typography className={classes.mainPot}>{`${pot.toLocaleString()}`}</Typography>
                    </>
                ) : null}
                <CommunityCards communityCards={communityCards} />
            </div>

            <div className={classes.playersCont}>{createSpotsAtTable()}</div>
            <div className={classes.betCont}>{createBetsAtTable()}</div>
        </div>
    );
}

export default Table;
