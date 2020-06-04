import React, { useState } from 'react';
import classnames from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import { Paper, Grow, Popper } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexWrap: 'wrap',
            overflow: 'auto',
        },
        iconButton: {
            height: '6vmin',
            width: '6vmin',
            borderRadius: '5%',
        },
        popper: {
            zIndex: 9000,
        },
    }),
);

function IconPicker(props) {
    const classes = useStyles();
    const { options, paperClass, placement } = props;

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    function handleClickButton(option) {}

    const open = Boolean(anchorEl);
    return (
        <>
            <IconButton className={classes.iconButton} onClick={handleClick}>
                <PersonIcon />
            </IconButton>
            <Popper className={classes.popper} open={open} anchorEl={anchorEl} transition placement={placement}>
                {({ TransitionProps }) => (
                    <Grow {...TransitionProps} timeout={350}>
                        <Paper className={classnames(classes.root, paperClass)} elevation={24}>
                            {options.map((option) => (
                                <IconButton className={classes.iconButton} onClick={() => handleClickButton(option)}>
                                    {option.icon}
                                </IconButton>
                            ))}
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}

export default IconPicker;
