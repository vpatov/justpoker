import React, { useState, useEffect } from 'react';

import classnames from 'classnames';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            zIndex: -1,
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.35)',
            borderBottomLeftRadius: '0.6vmin',
            borderBottomRightRadius: '0.6vmin',
            position: 'absolute',
            bottom: '0',
            left: '50%',
            margin: '0 auto',
            minWidth: '40%',
            transform: 'translateX(-50%)',
            transition: 'transform 0.3s ease-in-out',
            color: 'black',
        },
        show: {
            transform: 'translateY(100%) translateX(-50%)',
        },
    }),
);

function PlayerLabel(props) {
    const classes = useStyles();
    const { children, className } = props;

    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);

    return (
        <div
            className={classnames(classes.root, className, {
                [classes.show]: show,
            })}
        >
            {children}
        </div>
    );
}

export default PlayerLabel;
