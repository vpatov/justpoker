import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/Info';
import { Tooltip } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
    }),
);

function IconTooltip(props) {
    const classes = useStyles();
    const { ...rest } = props;

    return (
        <Tooltip {...rest}>
            <InfoIcon />
        </Tooltip>
    );
}

export default IconTooltip;
