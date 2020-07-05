import React from 'react';
import classnames from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography, Tooltip } from '@material-ui/core';
import { Global, UiPlayer, Controller } from '../shared/models/ui/uiState';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        handLabel: {
            fontSize: '1.8vmin',
            color: theme.palette.primary.main,
        },
        totalChips: {
            fontSize: '1.8vmin',
            color: theme.palette.primary.main,
        },
        handLabelSmaller: {
            fontSize: '1.5vmin',
        },
        playerPositonString: {
            fontSize: '1.8vmin',
            color: theme.palette.primary.main,
        },
        toActLabel: {
            fontSize: '1.8vmin',
            color: theme.palette.primary.main,
            animation: '$blinking 1.3s linear infinite;',
        },
    }),
);

// define props in terms of source interfaces
interface ControllerGameInfoProps {
    isHeroAtTable: Global['isHeroAtTable'];
    heroHandLabel: UiPlayer['handLabel'];
    heroTotalChips: Global['heroTotalChips'];
    playerPositionString: Controller['playerPositionString'];
    rootClassName: string;
}

function ControllerGameInfo(props: ControllerGameInfoProps) {
    const classes = useStyles();
    const { isHeroAtTable, heroTotalChips, heroHandLabel, playerPositionString, rootClassName } = props;

    return (
        <div className={rootClassName}>
            {!isHeroAtTable ? (
                <Tooltip title="Your current total chips." placement="right">
                    <Typography
                        className={classes.totalChips}
                    >{`Chips: ${heroTotalChips.toLocaleString()}`}</Typography>
                </Tooltip>
            ) : null}
            {heroHandLabel ? (
                <Tooltip title="Your current best hand." placement="right">
                    <Typography
                        className={classnames(classes.handLabel, {
                            [classes.handLabelSmaller]: heroHandLabel.length > 22,
                        })}
                    >
                        {heroHandLabel}
                    </Typography>
                </Tooltip>
            ) : null}
            {playerPositionString ? (
                <Tooltip title="Your position at the table relative to the dealer." placement="right">
                    <Typography className={classes.playerPositonString}>{playerPositionString}</Typography>
                </Tooltip>
            ) : null}
        </div>
    );
}

export default ControllerGameInfo;
