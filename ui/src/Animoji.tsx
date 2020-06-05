import React, { useState, useEffect } from 'react';
import classnames from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { AnimojiKeys } from './shared/models/assets';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        img: {
            width: `100%`,
            height: `100%`,
        },
    }),
);

const ANIMOJI_ASSET_ANIMATED = Object.values(AnimojiKeys).reduce((acc, key) => {
    acc[key] = import(`./assets/animoji/animated/${key}.gif`);
    return acc;
}, {});

const ANIMOJI_ASSET_STATIC = Object.values(AnimojiKeys).reduce((acc, key) => {
    acc[key] = import(`./assets/animoji/static/${key}.svg`);
    return acc;
}, {});

function Animoji(props) {
    const classes = useStyles();
    const { className, reaction, animated } = props;
    const [asset, SET_asset] = useState();

    console.log('render', reaction);
    useEffect(() => {
        if (animated) {
            ANIMOJI_ASSET_ANIMATED?.[reaction]?.then((asset) => {
                SET_asset(asset.default);
            });
        } else {
            ANIMOJI_ASSET_STATIC?.[reaction]?.then((asset) => {
                SET_asset(asset.default);
            });
        }
    }, [reaction]);

    if (asset) return <img className={classnames(classes.img, className)} src={asset} alt="" />;
    return <div className={classnames(classes.img, className)} />;
}

export default Animoji;
