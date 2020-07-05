import React from 'react';
import { useSelector } from 'react-redux';
import { controllerSelector, heroHandLabelSelector, globalGameStateSelector } from '../store/selectors';

import classnames from 'classnames';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

const fontSize = '1.8vmin';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        handLabel: {
            fontSize: fontSize,
            color: theme.palette.primary.main,
        },
        totalChips: {
            fontSize: fontSize,
            color: theme.palette.primary.main,
        },
        handLabelSmaller: {
            fontSize: '1.5vmin',
        },
        playerPositonString: {
            fontSize: fontSize,
            color: theme.palette.secondary.main,
        },
    }),
);

// left most informational section of the controller
// contains information about the user's chips, hand and position in game
// has no user interactable elements
function ControllerGameInfo(props) {
    const classes = useStyles();
    const { rootClassName } = props;
    const { playerPositionString } = useSelector(controllerSelector);
    const heroHandLabel = useSelector(heroHandLabelSelector);
    const { isHeroAtTable, heroTotalChips } = useSelector(globalGameStateSelector);
    return (
        <div className={rootClassName}>
            {!isHeroAtTable && heroTotalChips ? (
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
