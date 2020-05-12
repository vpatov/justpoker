import React from 'react';
import classnames from 'classnames';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme) => ({
    hoverZone: {
        width: '15vmin',
        height: '15vmin',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '&:hover button': {
            visibility: 'visible',
        },
    },
    root: {
        width: '8vmin',
        height: '8vmin',
        visibility: 'hidden',
    },
    text: {
        fontSize: '1.3vmin',
    },
}));

function EmptySeat(props) {
    const classes = useStyles();
    const { className, style, setHeroRotation, virtualPositon } = props;
    const handleClick = () => {
        setHeroRotation(virtualPositon);
    };
    return (
        <div className={classnames(classes.hoverZone, className)} style={style}>
            <IconButton className={classnames(classes.root)} onClick={handleClick}>
                <Typography className={classes.text}>Rotate Here</Typography>
            </IconButton>
        </div>
    );
}

export default EmptySeat;
