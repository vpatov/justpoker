import React, { useState, Fragment } from 'react';
import classnames from 'classnames';
import { heroPlayerUUIDSelector, globalGameStateSelector } from './store/selectors';
import { useSelector } from 'react-redux';
import { WsServer } from './api/ws';

import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import Typography from '@material-ui/core/Typography';
import BuyChipsDialog from './BuyChipsDialog';

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
    const heroPlayerUUID = useSelector(heroPlayerUUIDSelector);
    const {heroTotalChips} = useSelector(globalGameStateSelector);
    const handleCancel = () => {
        setDialogOpen(false);
    };

    const handleBuy = () => {
        // TODO This is a potential source of bug - The BuyChipsDialog sends a message to server with SETCHIPS, and
        // afterwards this function is executed. However, this function relies on the previous message actually being executed,
        // and it has no way of knowing that as of now. 
        WsServer.sendJoinTableMessage(heroPlayerUUID, seatNumber);
        setDialogOpen(false);
    };

    function onClickSitDown() {
        if (heroTotalChips > 0) WsServer.sendJoinTableMessage(heroPlayerUUID, seatNumber);
        else setDialogOpen(true);
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
            {dialogOpen ? (
                <BuyChipsDialog
                    open={dialogOpen}
                    handleCancel={handleCancel}
                    handleBuy={handleBuy}
                />
            ) : null}
        </Fragment>
    );
}

export default OpenSeat;
