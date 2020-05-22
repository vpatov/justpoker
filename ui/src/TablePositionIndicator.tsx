import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: 'black',
            borderRadius: '50%',
            height: '2.4vmin',
            width: '2.4vmin',
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            boxShadow: '0px 0px 0vmin 0.2vmin rgba(255,255,255,0.4)',
        },
        text: {
            fontSize: '1.2vmin',
            fontWeight: 'bold',
            color: 'white',
            lineHeight: 0,
        },
    }),
);

function TablePositionIndicator(props) {
    const classes = useStyles();
    const { type, style } = props;

    return (
        <div className={classes.root} style={style}>
            <Typography className={classes.text}>D</Typography>
        </div>
    );
}

export default TablePositionIndicator;
