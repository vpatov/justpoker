import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Help';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        icon: {
            cursor: 'help',
        },
    }),
);

function IconTooltip(props) {
    const classes = useStyles();
    const { icon, ...rest } = props;

    return <Tooltip {...rest}>{icon ? icon : <InfoIcon className={classes.icon} />}</Tooltip>;
}

export default IconTooltip;
