import React from 'react';
import { useSelector } from 'react-redux';
import { globalGameStateSelector } from './store/selectors';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            top: 0,
            right: 0,
            position: 'absolute',
            textAlign: 'right',
            margin: '2vmin',
        },
        text: {
            display: 'inline-block',
        },
    }),
);

function GameLabel(props) {
    const classes = useStyles();
    const {} = props;
    const globalData = useSelector(globalGameStateSelector);

    return (
        <div className={classes.root}>
            <Typography
                className={classes.text}
            >{`${globalData.gameType}  ${globalData.smallBlind}/${globalData.bigBlind}`}</Typography>
        </div>
    );
}

export default GameLabel;
