import React, { useEffect } from 'react';
import classnames from 'classnames';
import wink from './assets/animoji/wink.gif';
import thinking from './assets/animoji/thinking.gif';
import banana from './assets/animoji/banana.gif';
import cool from './assets/animoji/cool.gif';
import throwup from './assets/animoji/throwup.gif';
import why from './assets/animoji/why.gif';
import wow from './assets/animoji/wow.gif';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        img: {
            width: `100%`,
            height: `100%`,
        },
    }),
);

const GET_ANIMOJI_ASSET = {
    wink: wink,
    thinking: thinking,
    banana: banana,
    cool: cool,
    throwup: throwup,
    why: why,
    wow: wow,
};

function Animoji(props) {
    const classes = useStyles();
    const { className } = props;
    const id = 'emoji';

    const assetArr = Object.values(GET_ANIMOJI_ASSET);
    const asset = assetArr[Math.floor(Math.random() * assetArr.length)];

    return <img id={id} className={classnames(classes.img, className)} src={asset} alt="loading..." />;
}

export default Animoji;
