import React, { useState, Fragment } from 'react';
import classnames from 'classnames';

import OpenSeatDialog from './OpenSeatDialog';

import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    button: {
        width: '8vmin',
        height: '8vmin',
        border: `2px solid white`,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        color: 'white',
        '&:hover': {
            backgroundColor: grey[900],
        },
    },
    sit: {
        fontSize: '1.3vmin',
    },
}));

function OpenSeat(props) {
    const classes = useStyles();
    const { className, style, seatNumber } = props;
    const [dialogOpen, setDialogOpen] = useState(false);

    const dialogClose = () => {
        setDialogOpen(false);
    };

    function onClickSitDown() {
        setDialogOpen(true);
    }

    return (
        <Fragment>
            <IconButton
                color="primary"
                className={classnames(classes.button, className, 'CLASS_OpenSeatButton')}
                style={style}
                onClick={onClickSitDown}
            >
                <Typography className={classes.sit}>Sit Here</Typography>
            </IconButton>
            {dialogOpen ? <OpenSeatDialog open={dialogOpen} onClose={dialogClose} seatNumber={seatNumber} /> : null}
        </Fragment>
    );
}

export default OpenSeat;
