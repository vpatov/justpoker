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
import Color from 'color';

const W_UNIT = '%';
const H_UNIT = '%';

const TABLE_HEIGHT = 44;
const TABLE_WIDTH = 50;

const BET_HEIGHT = 32;
const BET_WIDTH = 40;

const HERO_DEFAULT_ROTATION = 5;

function positionToPlacement(virtualPositon) {
    const xInc = 100 / 8;
    const yInc = 100 / 6;
    const dict = {
        0: { x: xInc * 2, y: 0 },
        1: { x: xInc * 6, y: 0 },
        2: { x: xInc * 8, y: yInc * 2 },
        3: { x: xInc * 8, y: yInc * 4 },
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
        height: `calc(calc(${TABLE_HEIGHT}${H_UNIT} + ${theme.custom.PLAYER_HEIGHT}vmin ) + 8.8vmin)`,
        width: `calc(calc(${TABLE_WIDTH}${W_UNIT} + ${theme.custom.PLAYER_WIDTH}vmin ) + 5.6vmin)`,
        border: '6vmin solid transparent', // inscrease size for better hover radius
        '&:hover $emptySeat': {
            visibility: 'visible',
        },
        zIndex: 3,
        // used to prevent animation ghosting in safari
        // https://stackoverflow.com/questions/14383632/webkit-border-radius-and-overflow-bug-when-using-any-animation-transition/16681137
        '-webkit-backface-visibility': 'hidden',
        '-moz-backface-visibility': 'hidden',
        '-webkit-transform': 'translate3d(0, 0, 0)',
        '-moz-transform': 'translate3d(0, 0, 0)',
    },

    table: {
        position: 'absolute',
        height: `${TABLE_HEIGHT}${H_UNIT}`,
        width: `${TABLE_WIDTH}${W_UNIT}`,
        borderRadius: '30vmin',
        margin: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        ...theme.custom.TABLE,
        backgroundColor: theme.custom.BACKGROUND.backgroundColor,
    },
    betCont: {
        position: 'absolute',
        height: `${BET_HEIGHT}${H_UNIT}`,
        width: `${BET_WIDTH}${W_UNIT}`,
    },
    openSeat: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    hoverEmptyCont: {
        height: `${TABLE_HEIGHT + 16}${H_UNIT}`,
        width: `${TABLE_WIDTH + 16}${W_UNIT}`,
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
        width: '85vw',
        zIndex: 5,
        position: 'absolute',
        top: '25%',
        letterSpacing: '-0.8px',
        fontSize: '2.9vmin',
        fontWeight: 'bold',
        textAlign: 'center',
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
    const { canStartGame, isHeroAtTable, isGameInProgress, areOpenSeats, isSpectator, isHeroInHand, isGameInHandInitStage } = useSelector(
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

    function createSpotsAtTable() {
        const ans = [] as any;

        for (let index = 0; index < spots; index++) {
            const virtualPosition = computeVirtualPosition(index, heroRotation, heroPosition);
            const pPos = positionToPlacement(virtualPosition);
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
                            transform: 'translateY(-50%) translateX(-50%)',
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
                            transform: 'translateY(-50%) translateX(-50%)',
                        }}
                        setHeroRotation={(r) => {
                            setHeroRotation(r);
                        }}
                        isHeroInHand={isHeroInHand}
                        isGameInHandInitStage={isGameInHandInitStage}
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

            const bPos = positionToPlacement(virtualPosition);
            const player = players.find((p) => p.position === index);
            if (player && player.bet) {
                ans.push(
                    <Bet
                        key={index}
                        style={{
                            position: 'absolute',
                            top: `${bPos.y}${H_UNIT}`,
                            left: `${bPos.x}${W_UNIT}`,
                            transform: 'translateY(-20%) translateX(-50%)',
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
                {winningHandDescription ? (
                    <Zoom in={true}>
                        <Typography className={classes.winningHandDescription}>{winningHandDescription}</Typography>
                    </Zoom>
                ) : null}
            </div>

            <div className={classes.playersCont}>{createSpotsAtTable()}</div>
            <div className={classes.betCont}>{createBetsAtTable()}</div>
        </div>
    );
}

export default Table;
