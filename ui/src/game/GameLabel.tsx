import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import classnames from 'classnames';

import { globalGameStateSelector, selectGameParameters } from '../store/selectors';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import IconTooltip from '../reuseable/IconTooltip';
import AdminIcon from '@material-ui/icons/AccountBox';
import SpectatorsIcon from '@material-ui/icons/Visibility';

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
        spectating: {
            fontSize: '1.8vmin',
            color: theme.palette.error.contrastText,
        },
        icons: {
            marginRight: '.3vmin',
            marginTop: '.3vmin',
            position: 'relative',
            zIndex: 10,
        },
    }),
);

function GameLabel(props) {
    const classes = useStyles();

    const {
        gameWillStopAfterHand,
        gameParametersWillChangeAfterHand,
        adminNames,
        isSpectator,
        numberOfSpectators,
    } = useSelector(globalGameStateSelector);
    const { gameType, smallBlind, bigBlind } = useSelector(selectGameParameters);

    return (
        <div className={classes.root}>
            {gameParametersWillChangeAfterHand ? (
                <Typography className={classes.pause}>{`Game settings will change after this hand.`}</Typography>
            ) : null}
            {gameWillStopAfterHand ? (
                <Typography className={classes.pause}>{`Game will pause after this hand.`}</Typography>
            ) : null}
            <Typography className={classes.gameText}>{`${gameType}  ${smallBlind}/${bigBlind}`}</Typography>
            {isSpectator ? <Typography className={classes.spectating}>{`You are spectating.`}</Typography> : null}
            {numberOfSpectators > 0 ? (
                <IconTooltip
                    className={classnames(classes.icons)}
                    title={`${numberOfSpectators} ${
                        numberOfSpectators === 1 ? 'person is spectating.' : 'people are spectating.'
                    }`}
                    icon={<SpectatorsIcon />}
                    placement="bottom"
                />
            ) : null}
            <IconTooltip
                className={classnames(classes.icons)}
                title={`Admin${adminNames.length > 1 ? 's' : ''}: ${adminNames.join(', ')}`}
                icon={<AdminIcon />}
                placement="bottom"
            />
        </div>
    );
}

export default GameLabel;
