import React from 'react';
import classnames from 'classnames';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { green } from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        spectatorRoot: {
            display: 'flex',
            justifyContent: 'center !important',
            alignItems: 'center',
        },
        joinGameButton: {
            color: green[500],
            height: '60%',
            width: '12vw',
            maxWidth: '250px',
        },
    }),
);

function ControllerSpectator(props) {
    const classes = useStyles();
    const { className } = props;

    return (
        <div className={classnames(classes.spectatorRoot, className)}>
            <Button className={classes.joinGameButton} variant="outlined">
                Join Game
            </Button>
        </div>
    );
}

export default ControllerSpectator;
