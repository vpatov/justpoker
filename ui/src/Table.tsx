import React, { Fragment, useState } from 'react';
import Player from './Player';
import OpenSeat from './OpenSeat';
import EmptySeat from './EmptySeat';
import Bet from './Bet';
import PotTable from './PotTable';
import TableCopyLink from './TableCopyLink';
import CommunityCards from './CommunityCards';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { tableSelector, playersSelector, globalGameStateSelector, selectGameParameters } from './store/selectors';
import { ClientActionType, ClientWsMessageRequest } from './shared/models/api';
import { WsServer } from './api/ws';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Typography, Zoom } from '@material-ui/core';

const W_UNIT = 'vmin';
const H_UNIT = 'vmin';

const TABLE_HEIGHT = 39;
const TABLE_WIDTH = 71;

const PLAYER_HEIGHT = 58;
const PLAYER_WIDTH = 93;

const BET_HEIGHT = 30;
const BET_WIDTH = 60;

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
        4: { x: xInc * 6.5, y: yInc * 5.75 },
        5: { x: xInc * 4, y: yInc * 6 },
        6: { x: xInc * 1.5, y: yInc * 5.75 },
        7: { x: 0, y: yInc * 4 },
        8: { x: 0, y: yInc * 2 },
    };

    return dict[virtualIndex];
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
        transform: 'translateY(-50%) translateX(-50%)',
    },
    player: {
        position: 'absolute',
        top: 0,
        left: 0,
    },

    startGame: {
        zIndex: 5,
        fontSize: '4vmin',
    },
    winningHandDescription: {
        zIndex: 5,
        marginTop: '25vmin',
        fontSize: '3vmin',
        fontWeight: 'bold',
        textShadow: `0.2vmin 0.2vmin ${theme.palette.secondary.main}, 0.3vmin 0.3vmin ${theme.palette.primary.main}`,
        filter: 'drop-shadow(-0.1vmin -0.1vmin 0.2vmin black);',
    },
}));

function mod(n, m) {
    return ((n % m) + m) % m;
}

function Table(props) {
    const classes = useStyles();
    const { className } = props;
    const { canStartGame, heroIsSeated, isGameInProgress, areOpenSeats } = useSelector(globalGameStateSelector);
    const { maxPlayers } = useSelector(selectGameParameters);
    const { communityCards, spots, activePot, fullPot, inactivePots, awardPots, winningHandDescription } = useSelector(
        tableSelector,
    );
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
                    <Player
                        key={index}
                        setHeroRotation={(r) => {
                            setHeroRotation(r);
                        }}
                        virtualPositon={mod(index + offset - 1, 9)}
                        player={player}
                        className={classes.player}
                        style={{
                            top: `${pPos.y}${H_UNIT}`,
                            left: `${pPos.x}${W_UNIT}`,
                        }}
                    />,
                );
            } else if (!heroIsSeated && areOpenSeats) {
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
            } else {
                ans.push(
                    <EmptySeat
                        key={index}
                        className={classes.openSeat}
                        style={{
                            top: `${pPos.y}${H_UNIT}`,
                            left: `${pPos.x}${W_UNIT}`,
                        }}
                        setHeroRotation={(r) => {
                            setHeroRotation(r);
                        }}
                        virtualPositon={mod(index + offset - 1, 9)}
                    />,
                );
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
            const bPos = positionToPlacement(BET_WIDTH, BET_HEIGHT, index, offset);
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
                        id={'ID_StartGameButton'}
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
