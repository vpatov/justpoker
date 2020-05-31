import React from 'react';
import { useSelector } from 'react-redux';
import { globalGameStateSelector, selectGameParameters } from './store/selectors';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            top: 10,
            right: 15,
            position: 'absolute',
            textAlign: 'right',
            lineHeight: 0,
        },
        text: {
            display: 'inline-block',
            fontSize: '2vmin',
        },
        pause: {
            fontSize: '1.3vmin',
            color: theme.palette.error.contrastText,
        },
    }),
);

function GameLabel(props) {
    const classes = useStyles();
    const {} = props;
    const globalData = useSelector(globalGameStateSelector);
    const { gameType, smallBlind, bigBlind } = useSelector(selectGameParameters);

    return (
        <div className={classes.root}>
            {globalData.gameWillStopAfterHand ? (
                <Typography className={classes.pause}>{`Game will pause after this hand.`}</Typography>
            ) : null}
            <Typography className={classes.text}>{`${gameType}  ${smallBlind}/${bigBlind}`}</Typography>
        </div>
    );
}

export default GameLabel;
