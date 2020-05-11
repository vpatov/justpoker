import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {} from './utils';
import classnames from 'classnames';
import MakeGame from './MakeGame';
import Typography from '@material-ui/core/Typography';

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
        margin: 36,
        fontSize: 'min(90px, 10vmin)',
    },
}));

function Home(props) {
    const classes = useStyles();
    const {} = props;

    return (
        <div className={classes.root}>
            <Typography variant="h1" className={classes.title}>
                Just Poker.
            </Typography>
            <MakeGame />
        </div>
    );
}

export default Home;
