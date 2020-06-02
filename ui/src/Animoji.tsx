import React from 'react';
import classnames from 'classnames';
import wink from './assets/animoji/wink.gif';
import money from './assets/animoji/money.gif';
import banana from './assets/animoji/banana.gif';
import puke from './assets/animoji/puke.gif';
import wow from './assets/animoji/wow.gif';
import lol from './assets/animoji/lol.gif';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { ReactionTrigger } from './shared/models/animationState';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        img: {
            width: `100%`,
            height: `100%`,
        },
    }),
);

const ANIMOJI_ASSET = {
    [ReactionTrigger.WINK]: wink,
    [ReactionTrigger.MONEY]: money,
    [ReactionTrigger.BANANA]: banana,
    [ReactionTrigger.PUKE]: puke,
    [ReactionTrigger.WOW]: wow,
    [ReactionTrigger.LOL]: lol,
};

function Animoji(props) {
    const classes = useStyles();
    const { className, reaction } = props;

    return <img className={classnames(classes.img, className)} src={ANIMOJI_ASSET[reaction]} alt="" />;
}

export default Animoji;
