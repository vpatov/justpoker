import React from "react";

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {

        },
    }),
);

function Default(props) {
    const classes = useStyles();
    const { } = props;

    return <div className={classes.root}></div>;
}

export default Default;
