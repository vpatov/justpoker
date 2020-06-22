import React, { useState, useEffect } from 'react';
import Player from '../player/Player';
import OpenSeat from './OpenSeat';
import EmptySeat from './EmptySeat';
import Bet from './Bet';
import PotTable from './PotTable';
import TableCopyLink from './TableCopyLink';
import CommunityCards from './CommunityCards';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { tableSelector, playersSelector, globalGameStateSelector, selectGameParameters } from '../store/selectors';
import { ClientActionType, ClientWsMessageRequest } from '../shared/models/api/api';
import { WsServer } from '../api/ws';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Typography, Zoom } from '@material-ui/core';
import { SELENIUM_TAGS } from '../shared/models/test/seleniumTags';

const W_UNIT = 'vmin';
const H_UNIT = 'vmin';

const TABLE_HEIGHT = 39;
const TABLE_WIDTH = 71;

const PLAYER_HEIGHT = 60;
const PLAYER_WIDTH = 93;

const BET_HEIGHT = 30;
const BET_WIDTH = 60;

const HERO_DEFAULT_ROTATION = 5;

function positionToPlacement(width, height, virtualPositon) {
    const xInc = width / 8;
    const yInc = height / 6;
    const dict = {
        0: { x: xInc * 2, y: 0 },
        1: { x: xInc * 6, y: 0 },
        2: { x: width, y: yInc * 2 },
        3: { x: width, y: yInc * 4 },
        4: { x: xInc * 6.5, y: yInc * 5.75 },
        5: { x: xInc * 4, y: yInc * 6 },
        6: { x: xInc * 1.5, y: yInc * 5.75 },
        7: { x: 0, y: yInc * 4 },
        8: { x: 0, y: yInc * 2 },
    };

    return dict[virtualPositon];
}
const useStyles = makeStyles((theme) => ({
    root: {
        transform: 'translateY(-1.5%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playersCont: {
        position: 'absolute',
        height: `${PLAYER_HEIGHT}vmin`,
        width: `${PLAYER_WIDTH}vmin`,
        border: '6vmin solid transparent', // inscrease size for better hover radius
        '&:hover $emptySeat': {
            visibility: 'visible',
        },
        zIndex: 3,
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
    openSeat: {
        position: 'absolute',
        top: 0,
        left: 0,
        transform: 'translateY(-20%) translateX(-50%)',
    },
    hoverEmptyCont: {
        height: `${PLAYER_HEIGHT + 12}vmin`,
        width: `${PLAYER_WIDTH + 12}vmin`,
        '&:hover $emptySeat': {
            visibility: 'visible',
        },

        backgroundColor: 'red',
        top: 0,
        left: 0,
    },
    emptySeat: {
        position: 'absolute',
        top: 0,
        left: 0,
        transform: 'translateY(-20%) translateX(-50%)',
    },
    player: {
        position: 'absolute',
        top: 0,
        left: 0,
        transition: 'top 0.4s, left 0.4s',
    },

    startGame: {
        zIndex: 5,
        fontSize: '4vmin',
    },
    winningHandDescription: {
        zIndex: 5,
        marginTop: '27vmin',
        letterSpacing: '-0.8px',
        fontSize: '3.1vmin',
        fontWeight: 'bold',
        color: 'white',
        textShadow: `0.2vmin 0.2vmin ${theme.palette.secondary.main}`,
    },
}));

function mod(n, m) {
    return ((n % m) + m) % m;
}

function Table(props) {
    const classes = useStyles();
    const { className } = props;
    const { canStartGame, isHeroAtTable, isGameInProgress, areOpenSeats, isSpectator, isHeroInHand } = useSelector(
        globalGameStateSelector,
    );
    const { communityCards, spots, activePot, fullPot, inactivePots, awardPots, winningHandDescription } = useSelector(
        tableSelector,
    );
    const players = useSelector(playersSelector);
    const [heroRotation, setHeroRotation] = useState(HERO_DEFAULT_ROTATION);

    const heroPosition = players.find((p) => Boolean(p.hero))?.position || 0;

    function computeVirtualPosition(index, heroRotation, heroPosition) {
        return mod(index + heroRotation - heroPosition, 9);
    }

    console.log(heroRotation, heroPosition);
    function createSpotsAtTable() {
        const ans = [] as any;

        for (let index = 0; index < spots; index++) {
            const virtualPosition = computeVirtualPosition(index, heroRotation, heroPosition);
            const pPos = positionToPlacement(PLAYER_WIDTH, PLAYER_HEIGHT, virtualPosition);
            const player = players.find((p) => p.position === index);

            if (player) {
                ans.push(
                    <Player
                        key={index}
                        setHeroRotation={(r) => {
                            setHeroRotation(r);
                        }}
                        virtualPositon={virtualPosition}
                        player={player}
                        className={classes.player}
                        style={{
                            top: `${pPos.y}${H_UNIT}`,
                            left: `${pPos.x}${W_UNIT}`,
                        }}
                    />,
                );
            } else if (!isHeroAtTable && areOpenSeats && !isSpectator) {
                ans.push(
                    <OpenSeat
                        key={index}
                        seatNumber={index}
                        className={classes.openSeat}
                        style={{
                            top: `${pPos.y}${H_UNIT}`,
                            left: `${pPos.x}${W_UNIT}`,
                        }}
                    />,
                );
            } else if (isHeroAtTable) {
                ans.push(
                    <EmptySeat
                        key={index}
                        className={classes.emptySeat}
                        seatNumber={index}
                        style={{
                            top: `${pPos.y}${H_UNIT}`,
                            left: `${pPos.x}${W_UNIT}`,
                        }}
                        setHeroRotation={(r) => {
                            setHeroRotation(r);
                        }}
                        isHeroInHand={isHeroInHand}
                        virtualPositon={virtualPosition}
                    />,
                );
            } else {
                ans.push(null);
            }
        }
        return ans;
    }

    function onClickStartGame() {
        sendServerAction(ClientActionType.STARTGAME);
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
            const virtualPosition = computeVirtualPosition(index, heroRotation, heroPosition);

            const bPos = positionToPlacement(BET_WIDTH, BET_HEIGHT, virtualPosition);
            const player = players.find((p) => p.position === index);
            if (player && player.bet) {
                ans.push(
                    <Bet
                        key={index}
                        style={{
                            position: 'absolute',
                            top: `${bPos.y}${H_UNIT}`,
                            left: `${bPos.x}${W_UNIT}`,
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
                    <Button
                        id={SELENIUM_TAGS.IDS.START_GAME_BUTTON}
                        className={classes.startGame}
                        color="primary"
                        variant="contained"
                        onClick={onClickStartGame}
                    >
                        Start Game
                    </Button>
                ) : null}
                {isGameInProgress ? (
                    <>
                        <PotTable
                            activePot={activePot}
                            fullPot={fullPot}
                            inactivePots={inactivePots}
                            awardPots={awardPots}
                        />
                        <CommunityCards communityCards={communityCards} />
                    </>
                ) : null}
                {players.length < 2 && !isGameInProgress ? <TableCopyLink /> : null}
            </div>
            {winningHandDescription ? (
                <Zoom in={true}>
                    <Typography className={classes.winningHandDescription}>{winningHandDescription}</Typography>
                </Zoom>
            ) : null}
            <div className={classes.playersCont}>{createSpotsAtTable()}</div>
            <div className={classes.betCont}>{createBetsAtTable()}</div>
        </div>
    );
}

export default Table;