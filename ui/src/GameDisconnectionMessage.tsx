import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        message: {
            position: 'absolute',
            top: 12,
            fontSize: '3.5vmin',
            color: 'black',
            width: '100%',
            textAlign: 'center',
        },
    }),
);

function GameDisconnectionMessage(props) {
    const classes = useStyles();

    return <Typography className={classes.message}>Disconnected. Try to refresh to reconnect.</Typography>;
}

export default GameDisconnectionMessage;
