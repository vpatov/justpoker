import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography, Tooltip } from '@material-ui/core';
import { PositionIndicator } from './shared/models/uiState';
import yellow from '@material-ui/core/colors/yellow';
import orange from '@material-ui/core/colors/orange';
import grey from '@material-ui/core/colors/grey';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: 'black',
            borderRadius: '50%',
            height: '2vmin',
            width: '2vmin',
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            border: '0.17vmin solid white',
            transform: 'translateY(-50%) translateX(50%)',
            boxShadow: '0 0 4px 1px rgba(0,0,0,0.5)',
        },
        text: {
            fontSize: '1vmin',
            lineHeight: 0,
        },
    }),
);

function TablePositionIndicator(props) {
    const classes = useStyles();
    const { positionIndicator } = props;

    switch (positionIndicator) {
        case PositionIndicator.BUTTON:
            return (
                <Tooltip title="Dealer" placement="right">
                    <div
                        className={classes.root}
                        style={{
                            backgroundColor: grey[900],
                            color: 'white',
                        }}
                    >
                        <Typography className={classes.text}>{'D'}</Typography>
                    </div>
                </Tooltip>
            );
        case PositionIndicator.SMALL_BLIND:
            return (
                <Tooltip title="Small Blind" placement="right">
                    <div
                        className={classes.root}
                        style={{
                            backgroundColor: yellow[800],
                        }}
                    >
                        <Typography className={classes.text}>{'SB'}</Typography>
                    </div>
                </Tooltip>
            );
        case PositionIndicator.BIG_BLIND:
            return (
                <Tooltip title="Big Blind" placement="right">
                    <div
                        className={classes.root}
                        style={{
                            backgroundColor: orange[800],
                        }}
                    >
                        <Typography className={classes.text}>{'BB'}</Typography>
                    </div>
                </Tooltip>
            );

        default:
            return null;
    }
}

export default TablePositionIndicator;
