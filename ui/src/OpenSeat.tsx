import React, { useState, Fragment } from 'react';
import classnames from 'classnames';
import { heroPlayerUUIDSelector } from './store/selectors';
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
    const { className, style } = props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const heroPlayerUUID = useSelector(heroPlayerUUIDSelector);
    const handleCancel = () => {
        setDialogOpen(false);
    };

    const handleBuy = () => {
        WsServer.sendJoinTableMessage(heroPlayerUUID);
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
            {dialogOpen ? (
                <BuyChipsDialog
                    open={dialogOpen}
                    handleCancel={handleCancel}
                    handleBuy={handleBuy}
                    sitDownOnBuy={true}
                />
            ) : null}
        </Fragment>
    );
}

export default OpenSeat;
