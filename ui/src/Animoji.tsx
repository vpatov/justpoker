import React, { useEffect } from 'react';
import classnames from 'classnames';
import wink from './animojiAssets/wink.gif';
import thinking from './animojiAssets/thinking.gif';
import ohno from './animojiAssets/ohno.gif';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { animateEmoji } from './AnimiationModule';

const size = 8;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        img: {
            position: 'absolute',
            zIndex: 7,
            width: `${size}vmin`,
            height: `${size}vmin`,
            top: '20%',
            left: `calc(50% - ${size / 2}vmin)`,
            // margin-right: -50%;
            // transform: 'translate(-50%, -50%)',
        },
    }),
);

function Animoji(props) {
    const classes = useStyles();
    const { className } = props;
    const id = 'emoji';

    useEffect(() => {
        animateEmoji(id);
    }, []);

    return <img id={id} className={classnames(classes.img, className)} src={wink} alt="loading..." />;
}

export default Animoji;
