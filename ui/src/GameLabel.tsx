import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import classnames from 'classnames';

import { globalGameStateSelector, selectGameParameters } from './store/selectors';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import IconTooltip from './reuseable/IconTooltip';
import AdminIcon from '@material-ui/icons/AccountBox';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            top: 10,
            right: 15,
            position: 'absolute',
            textAlign: 'right',
            lineHeight: 0,
        },
        gameText: {
            fontSize: '2vmin',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
        pause: {
            fontSize: '1.3vmin',
            color: theme.palette.error.contrastText,
        },
        adminIcon: {
            position: 'relative',
            zIndex: 10,
        },
        blink: {
            animation: '$blinking 0.8s linear 1;',
        },
        '@keyframes blinking': {
            '50%': {
                color: theme.palette.primary.main,
            },
        },
    }),
);

function GameLabel(props) {
    const classes = useStyles();

    const [blink, SET_blink] = useState(false);
    const { gameWillStopAfterHand, gameParametersWillChangeAfterHand, adminNames } = useSelector(
        globalGameStateSelector,
    );
    const { gameType, smallBlind, bigBlind } = useSelector(selectGameParameters);

    useEffect(() => {
        SET_blink(false);
        SET_blink(true);
    }, [adminNames]);
    return (
        <div className={classes.root}>
            {gameParametersWillChangeAfterHand ? (
                <Typography className={classes.pause}>{`Game settings will change after this hand.`}</Typography>
            ) : null}
            {gameWillStopAfterHand ? (
                <Typography className={classes.pause}>{`Game will pause after this hand.`}</Typography>
            ) : null}

            <Typography className={classes.gameText}>
                <IconTooltip
                    className={classnames(classes.adminIcon, { [classes.blink]: blink })}
                    title={`Admin${adminNames.length > 1 ? 's' : ''}: ${adminNames.join(', ')}`}
                    icon={<AdminIcon />}
                    placement="left"
                />
                {`${gameType}  ${smallBlind}/${bigBlind}`}
            </Typography>
        </div>
    );
}

export default GameLabel;
