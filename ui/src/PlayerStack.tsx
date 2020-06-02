import React, { useEffect, useRef } from 'react';
import CountUp from 'react-countup';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import classnames from 'classnames';
import TablePositionIndicator from './TablePositionIndicator';
import PlayerAvatar from './PlayerAvatar';
import Animoji from './Animoji';

const useStyles = makeStyles((theme) => ({
    stackCont: {
        width: '100%',
        marginTop: '-1vmin',
        position: 'relative',
        display: 'flex',
        height: '6vmin',
        alignItems: 'center',
        cursor: 'pointer',
        border: '0.25vmin solid transparent',
        '&:hover': {
            borderColor: theme.palette.secondary.main,
        },

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
        width: '60%',
    },
    avatar: {
        marginLeft: '-11%',
        marginRight: '0.3vmin',
        flexShrink: 0,
        height: '6.8vmin',
        width: '6.8vmin',
    },
    name: {
        paddingBottom: '0.8vmin',

        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',

        fontSize: '1.3vmin',
    },
    stack: {
        paddingTop: '0.8vmin',
        fontWeight: 'bold',
        fontSize: '1.7vmin',
    },
    buttonR: {
        fontWeight: 'bold',
        fontSize: '1.7vmin',
        paddingTop: '0.3vmin',
        paddingRight: '0.3vmin',
        float: 'right',
        height: '2vmin',
        width: '2vmin',
    },
    act: {
        backgroundColor: 'rgba(0, 236, 255, 1)',
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
    const { stack, name, positionIndicator, winner, toAct, outOfHand, position, playerUUID, onClickStack } = props;

    const prevStack = usePrevious(stack);

    return (
        <div
            onClick={onClickStack}
            className={classnames(classes.stackCont, {
                [classes.toAct]: toAct,
                [classes.winner]: winner,
                [classes.outOfHand]: outOfHand,
            })}
        >
            <PlayerAvatar className={classes.avatar} position={position} playerUUID={playerUUID} />
            {positionIndicator ? <TablePositionIndicator type="button" positionIndicator={positionIndicator} /> : null}
            <div className={classes.nameStackCont}>
                <Typography variant="h4" className={classes.stack}>
                    {winner ? <CountUp start={prevStack} end={stack} separator="," /> : stack.toLocaleString()}
                </Typography>
                <Typography variant="body1" className={classes.name}>
                    {name}
                </Typography>
            </div>
        </div>
    );
}

export default PlayerStack;
