import React, { useState } from 'react';
import classnames from 'classnames';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import JoinGameDialog from '../game/JoinGameDialog';
import { SELENIUM_TAGS } from '../shared/models/test/seleniumTags';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        spectatorRoot: {
            display: 'flex',
            justifyContent: 'center !important',
            alignItems: 'center',
        },
        joinGameButton: {
            height: '60%',
            width: '12vw',
            maxWidth: '250px',
            fontSize: '2.4vmin',
        },
    }),
);

function ControllerSpectator(props) {
    const classes = useStyles();
    const { className } = props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const handleClose = () => {
        setDialogOpen(false);
    };

    return (
        <div className={classnames(classes.spectatorRoot, className)}>
            <Button
                className={classes.joinGameButton}
                onClick={() => setDialogOpen(true)}
                variant="contained"
                color="primary"
                autoFocus
                id={SELENIUM_TAGS.IDS.JOIN_GAME_BUTTON}
            >
                Join Game
            </Button>
            {dialogOpen ? <JoinGameDialog open={dialogOpen} handleClose={handleClose} /> : null}
        </div>
    );
}

export default ControllerSpectator;
