import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import { Paper } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        iconButton: {
            height: '5vmin',
            width: '5vmin',
            borderRadius: '5%',
        },
    }),
);

function IconPicker(props) {
    const classes = useStyles();
    const { options } = props;
    function handleClickButton(option) {}

    return (
        <Paper className={classes.root}>
            {options.map((option) => (
                <IconButton className={classes.iconButton} onClick={() => handleClickButton(option)}>
                    {option.icon}
                </IconButton>
            ))}
        </Paper>
    );
}

export default IconPicker;
