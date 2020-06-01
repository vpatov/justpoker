import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/Help';
import { Tooltip } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        icon: {
            cursor: 'help',
        },
    }),
);

function IconTooltip(props) {
    const classes = useStyles();
    const { ...rest } = props;

    return (
        <Tooltip {...rest}>
            <InfoIcon className={classes.icon} />
        </Tooltip>
    );
}

export default IconTooltip;
