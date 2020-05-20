import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ErrorDisplay } from './shared/models/uiState';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    title: {
        position: 'absolute',
        margin: 36,
    },
    link: {
        position: 'absolute',
        '&:hover': {
            color: theme.palette.secondary.main,
        },
        margin: 36,
        marginTop: 80,
    },
}));

export interface ErrorMessageProps {
    errorDisplay: ErrorDisplay;
}

function ErrorMessage(props: ErrorMessageProps) {
    const classes = useStyles();
    const { message, redirect } = props.errorDisplay;
    return (
        <>
            <Typography variant="h5" className={classes.title}>
                {message}
            </Typography>
            {redirect ? (
                <Typography variant="h6" className={classes.link}>
                    <Link to={redirect.url}>{redirect.text}</Link>
                </Typography>
            ) : null}
        </>
    );
}

export default ErrorMessage;
