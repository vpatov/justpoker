import React, { useState } from 'react';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import MakeGame from './MakeGame';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Button } from '@material-ui/core';
import EmailDialog from '../reuseable/EmailDialog';
const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        background: `radial-gradient(circle, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 150%)`,
        overflow: 'auto',
    },
    title: {
        marginTop: 72,
        marginBottom: 12,
        fontSize: 'min(90px, 9vmin)',
        color: 'black',
    },
    left: {
        position: 'absolute',
        left: '0',
        width: '25%',
        top: '0',
        margin: 24,
        lineHeight: '100%',
    },
    contactUs: {
        position: 'absolute',
        margin: 12,
        left: '0',
        bottom: '0',
        color: 'black',
    },
}));

function Home(props) {
    const classes = useStyles();
    const [openEmail, SET_openEmail] = useState(false);
    const smallHeight = useMediaQuery('(max-height:750px)');
    return (
        <div className={classes.root}>
            <Typography className={classnames(classes.title, { [classes.left]: smallHeight })}>Just Poker.</Typography>
            <MakeGame />
            <Button className={classes.contactUs} onClick={() => SET_openEmail(true)}>
                Contact Us
            </Button>
            <EmailDialog open={openEmail} onClose={() => SET_openEmail(false)} />
        </div>
    );
}

export default Home;
