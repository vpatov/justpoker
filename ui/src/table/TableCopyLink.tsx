import React, { useState } from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography, ButtonBase } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            zIndex: 5,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            backgroundColor: 'rgba(0,0,0,0.3)',
            width: '80%',
            height: '25%',
            borderRadius: '1.5vmin',
            padding: '1vmin',
            '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.2)',
            },
        },
        text: {
            fontSize: '1.8vmin',
        },
        url: {
            userSelect: 'all',
            fontSize: '1.4vmin',
        },
        copied: {
            fontSize: '2vmin',
            color: theme.palette.success.light,
        },
    }),
);

function TableCopyLink(props) {
    const classes = useStyles();
    const [copied, copiedSet] = useState(false);
    function handleClick() {
        if (!navigator.clipboard) {
            console.warn('Clipboard api not avaliable. Not copied.');
            return;
        }
        const text = window.location.href;
        try {
            navigator.clipboard.writeText(text);
            copiedSet(true);
            setTimeout(() => copiedSet(false), 1000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    }
    return (
        <ButtonBase className={classes.root} onClick={handleClick}>
            {copied ? (
                <Typography className={classes.copied}>Copied to clipboard!</Typography>
            ) : (
                <>
                    <Typography className={classes.text}>Send link to friends to join. Click to copy link:</Typography>
                    <Typography className={classes.url}>{window.location.href}</Typography>{' '}
                </>
            )}
        </ButtonBase>
    );
}

export default TableCopyLink;
