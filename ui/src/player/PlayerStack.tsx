import React, { useEffect, useRef } from 'react';
import CountUp from 'react-countup';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AdminIcon from '@material-ui/icons/Stars';

import classnames from 'classnames';
import TablePositionIndicator from '../table/TablePositionIndicator';
import PlayerAvatar from './PlayerAvatar';
import Animoji from '../reuseable/Animoji';
import { Tooltip } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    stackCont: {
        width: '100%',
        marginTop: '-1vmin',
        position: 'relative',
        display: 'flex',
        height: '6vmin',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: '0.6vmin',
        ...theme.custom.STACK,
    },
    outOfHand: {
        boxShadow: theme.shadows[3],
    },
    toAct: {
        ...theme.custom.STACK_TO_ACT,
    },
    winner: {
        ...theme.custom.STACK_WINNER,
    },
    '@keyframes grad': {
        '0%': {
            backgroundPosition: '0% 0%',
        },
        '100%': {
            backgroundPosition: '200% -200%',
        },
    },
    nameStackCont: {
        width: '54%',
    },
    name: {
        paddingBottom: '0.8vmin',
        whiteSpace: 'nowrap',
        display: 'flex',
        justifyContent: 'start',
        alignItems: 'center',
        overflow: 'hidden',
        fontSize: '1.6vmin',
    },
    stack: {
        paddingTop: '1vmin',
        fontWeight: 'bold',
        fontSize: '2vmin',
    },
    winnerAnimojiCont: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    winnerAnimoji: {
        width: `100%`,
        height: '20vmin',
        position: 'absolute',
    },
    overLay: {
        borderRadius: '0.6vmin',

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    labelText: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: '1.8vmin',
    },
    adminIcon: {
        width: '1.7vmin',
        height: '1.7vmin',
        marginTop: '0.1vmin',
        marginRight: '0.22vmin',
    },
}));

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

function PlayerStack(props) {
    const classes = useStyles();
    const { player, onClickStack } = props;
    const {
        stack,
        name,
        toAct,
        winner,
        positionIndicator,
        folded,
        uuid,
        sittingOut,
        avatarKey,
        position,
        disconnected,
        quitting,
        leaving,
        admin,
    } = player;
    const outOfHand = sittingOut || folded;
    const prevStack = usePrevious(stack);

    function getPlayerOverlay() {
        const comps = [] as any;
        if (disconnected) {
            comps.push(
                <Typography key={'disconnected'} className={classes.labelText}>
                    Disconnected
                </Typography>,
            );
        } else if (quitting) {
            comps.push(
                <Typography key={'quitting'} className={classes.labelText}>
                    Quitting
                </Typography>,
            );
        } else if (leaving) {
            comps.push(
                <Typography key={'leaving'} className={classes.labelText}>
                    Leaving
                </Typography>,
            );
        } else if (sittingOut) {
            comps.push(
                <Typography key={'sittingOut'} className={classes.labelText}>
                    Sitting Out
                </Typography>,
            );
        }

        if (comps.length) {
            return <div className={classes.overLay}>{comps}</div>;
        }
        return null;
    }
    return (
        <div
            onClick={onClickStack}
            className={classnames(classes.stackCont, {
                [classes.toAct]: toAct,
                [classes.winner]: winner,
                [classes.outOfHand]: outOfHand,
            })}
        >
            {getPlayerOverlay()}
            {winner ? (
                <div className={classes.winnerAnimojiCont}>
                    <Animoji reaction={'winner'} className={classes.winnerAnimoji} animated />
                </div>
            ) : null}
            <PlayerAvatar position={position} playerUUID={uuid} avatarKey={avatarKey} />
            {positionIndicator ? <TablePositionIndicator type="button" positionIndicator={positionIndicator} /> : null}
            <div className={classes.nameStackCont}>
                <Typography variant="h4" className={classes.stack}>
                    {winner ? <CountUp start={prevStack} end={stack} separator="," /> : stack.toLocaleString()}
                </Typography>
                <Typography variant="body1" className={classes.name}>
                    {admin ? (
                        <Tooltip title="Admin">
                            <AdminIcon className={classes.adminIcon} />
                        </Tooltip>
                    ) : null}
                    {name}
                </Typography>
            </div>
        </div>
    );
}

export default PlayerStack;
