import React from 'react';
import classnames from 'classnames';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { WsServer } from '../api/ws';
import { grey } from '@material-ui/core/colors';

const size = 5;

const useStyles = makeStyles((theme) => ({
    emptySeatRoot: {
        width: `${size * 2}vmin`,
        height: `${size * 2}vmin`,
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        border: `0.2vmin solid ${grey[300]}`,
        visibility: 'hidden',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        clipPath: `circle(${size}vmin at ${size}vmin ${size}vmin)`,
    },
    button: {
        borderRadius: 'unset',
        width: `${size * 2}vmin`,
        height: `${size}vmin`,
    },
    topButtonText: {
        marginTop: '1vmin',
    },
    bottomButtonText: {
        marginBottom: '1vmin',
    },
    text: {
        fontSize: '1.2vmin',
    },
}));

function EmptySeat(props) {
    const classes = useStyles();
    const { className, style, setHeroRotation, virtualPositon, seatNumber, isHeroInHand } = props;

    function handleRotationButtonClick() {
        setHeroRotation(virtualPositon);
    }

    function handleSeatChangeClick() {
        WsServer.sendSeatChangeMessage(seatNumber);
        setHeroRotation(virtualPositon);
    }

    function renderRotateButton(semicircle: boolean) {
        return (
            <IconButton
                className={classnames(classes.button)}
                onClick={handleRotationButtonClick}
                style={semicircle ? {} : { height: `${size * 2}vmin` }}
            >
                <Typography className={classnames(classes.text, semicircle ? classes.topButtonText : null)}>
                    Rotate Here
                </Typography>
            </IconButton>
        );
    }

    function renderSeatChangeButton() {
        return (
            <IconButton className={classnames(classes.button)} onClick={handleSeatChangeClick}>
                <Typography className={classnames(classes.text, classes.bottomButtonText)}>Sit Here</Typography>
            </IconButton>
        );
    }

    return (
        <div className={classnames(classes.emptySeatRoot, className)} style={style}>
            <div className={classes.container}>
                {isHeroInHand ? renderRotateButton(false) : renderRotateButton(true)}
                {isHeroInHand ? null : renderSeatChangeButton()}
            </div>
        </div>
    );
}

export default EmptySeat;
