import React, { useState, useEffect } from 'react';
import classnames from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import { Paper, Grow, Popper } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexWrap: 'wrap',
            overflow: 'auto',
        },
        iconButton: {
            height: '5vmin',
            width: '5vmin',
            borderRadius: '5%',
            padding: '0.4min',
        },
        popper: {
            zIndex: 9000,
        },
    }),
);

function IconPicker(props) {
    const classes = useStyles();
    const { options, paperClass, placement, initIcon, onSelect, size, hoverOpen, buttonClass, open } = props;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [renderOptions, SET_renderOptions] = useState(false);
    const [timer, SET_timer] = useState(0);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
        // this is to ensure paper renders first, then we try to render large set of images
        // I can't tell if this is really hacky and bad or sorta clever...
        clearTimeout(timer);
        SET_timer(window.setTimeout(() => SET_renderOptions(true), 50));
    };

    function handleClickButton(option) {
        onSelect(option);
        setAnchorEl(null);
    }

    useEffect(() => {
        return clearTimeout(timer);
    }, [timer]);

    const showMenu = Boolean(anchorEl);
    return (
        <>
            <IconButton
                className={classnames(classes.iconButton, buttonClass)}
                onClick={hoverOpen ? undefined : handleOpen}
                onMouseEnter={hoverOpen ? handleOpen : undefined}
                style={{ width: size, height: size }}
            >
                {initIcon ? initIcon : <PersonIcon />}
            </IconButton>
            {open || showMenu ? (
                <Popper className={classes.popper} open={true} anchorEl={anchorEl} transition placement={placement}>
                    {({ TransitionProps }) => (
                        <Grow {...TransitionProps} timeout={350}>
                            <Paper className={classnames(classes.root, paperClass)} elevation={24}>
                                {renderOptions ? (
                                    <Options
                                        options={options}
                                        handleClickButton={handleClickButton}
                                        style={{ width: size, height: size }}
                                        className={classes.iconButton}
                                    />
                                ) : null}
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            ) : null}
        </>
    );
}

function Options(props) {
    const { options, handleClickButton, style, className } = props;

    return options.map((option, i) => (
        <IconButton key={i} className={className} onClick={() => handleClickButton(option)} style={style}>
            {option.icon}
        </IconButton>
    ));
}

export default IconPicker;
