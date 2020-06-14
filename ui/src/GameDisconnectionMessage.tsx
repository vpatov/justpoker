import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            position: 'absolute',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '90vh',
            zIndex: 100,
        },
        message: {
            top: 36,
            position: 'absolute',
            fontSize: '4.5vmin',
            color: 'black',

            textAlign: 'center',
        },
        button: {
            fontSize: '3.8vmin',
            fontWeight: 'bold',
            width: '22vw',
            height: '16vh',
        },
    }),
);

function GameDisconnectionMessage(props) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Typography className={classes.message}>Uh Oh! You Are Disconnected.</Typography>

            <Button
                className={classes.button}
                color="primary"
                variant="contained"
                onClick={() => window.location.reload()}
            >
                Reconnect!
            </Button>
        </div>
    );
}

export default GameDisconnectionMessage;
