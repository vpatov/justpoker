import React from 'react';
import { useSelector } from 'react-redux';
import classnames from 'classnames';

import { globalGameStateSelector, selectGameParameters } from '../store/selectors';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import IconTooltip from '../reuseable/IconTooltip';
import AdminIcon from '@material-ui/icons/AccountBox';
import SpectatorsIcon from '@material-ui/icons/Visibility';
import { useChipFormatter } from './ChipFormatter';
import { startCase } from 'lodash';
import { stringArrayToSentence } from '../utils';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            top: 10,
            right: 15,
            position: 'absolute',
            textAlign: 'right',
            lineHeight: 0,
            color: theme.custom.BACKGROUND_CONTRAST_COLOR,
        },
        gameText: {
            fontSize: '2vmin',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
        pause: {
            fontSize: '1.5vmin',
        },
        spectating: {
            fontSize: '1.8vmin',
        },
        icons: {
            marginRight: '.3vmin',
            marginTop: '.3vmin',
            position: 'relative',
            zIndex: 5,
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
        willAddChips,
        currentBlindsLevel,
    } = useSelector(globalGameStateSelector);
    const { gameType, smallBlind, bigBlind, blindsIntervalMinutes } = useSelector(selectGameParameters);
    const ChipFormatter = useChipFormatter();
    const isThereABlindsSchedule = blindsIntervalMinutes > 0;
    return (
        <div className={classes.root}>
            {willAddChips ? (
                <Typography className={classes.pause}>{`Up to ${ChipFormatter(
                    willAddChips,
                )} chips will be added to your total after this hand.`}</Typography>
            ) : null}
            {gameParametersWillChangeAfterHand.length ? (
                <Typography className={classes.pause}>{`${stringArrayToSentence(
                    gameParametersWillChangeAfterHand.map((s) => startCase(s)),
                )} will change after this hand.`}</Typography>
            ) : null}
            {gameWillStopAfterHand ? (
                <Typography className={classes.pause}>{`Game will pause after this hand.`}</Typography>
            ) : null}
            <Typography className={classes.gameText}>{`${gameType}  ${ChipFormatter(smallBlind)}/${ChipFormatter(
                bigBlind,
            )}`}</Typography>
            {isThereABlindsSchedule ? (
                <Typography className={classes.gameText}>{`Blind Level ${currentBlindsLevel}`}</Typography>
            ) : null}
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
