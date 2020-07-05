import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { globalGameStateSelector } from '../store/selectors';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import JoinGameDialog from '../game/JoinGameDialog';
import { SELENIUM_TAGS } from '../shared/models/test/seleniumTags';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        joinGameButton: {
            height: '60%',
            width: '12vw',
            maxWidth: '250px',
            fontSize: '2.4vmin',
        },
    }),
);

// should be render when player is a spectator, gives option to join game
function ControllerSpectator(props) {
    const classes = useStyles();
    const { rootClassName } = props;
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleClose = () => {
        setDialogOpen(false);
    };

    const { isSpectator } = useSelector(globalGameStateSelector);

    if (!isSpectator) return null;

    return (
        <div className={rootClassName}>
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
