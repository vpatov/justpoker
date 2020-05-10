import React from 'react';
import { useSelector } from 'react-redux';
import { globalGameStateSelector } from './store/selectors';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            top: '0vmin',
            right: 0,
            position: 'absolute',
            textAlign: 'right',
            margin: '2vmin',
        },
        text: {
            display: 'inline-block',
            fontSize: '2vmin',
        },
        pause: {
            fontSize: '1.3vmin',
            color: theme.palette.error.light,
        },
    }),
);

function GameLabel(props) {
    const classes = useStyles();
    const {} = props;
    const globalData = useSelector(globalGameStateSelector);
    const { gameWillStopAfterHand, gameType, smallBlind, bigBlind } = globalData;
    return (
        <div className={classes.root}>
            {gameWillStopAfterHand ? (
                <Typography className={classes.pause}>{`Game will pause after this hand.`}</Typography>
            ) : null}
            <Typography className={classes.text}>{`${gameType}  ${smallBlind}/${bigBlind}`}</Typography>
        </div>
    );
}

export default GameLabel;
