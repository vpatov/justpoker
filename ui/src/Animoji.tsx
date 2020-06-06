import React, { useState, useEffect } from 'react';
import classnames from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        img: {
            width: `100%`,
            height: `100%`,
            filter: `drop-shadow(0px 0px 3px rgba(0, 0, 0, .7))`,
        },
    }),
);

function Animoji(props) {
    const classes = useStyles();
    const { className, reaction, animated } = props;
    const [asset, SET_asset] = useState();

    useEffect(() => {
        if (animated) {
            import(`./assets/animoji/animated/${reaction}.gif`)
                .then((asset) => {
                    SET_asset(asset.default);
                })
                .catch(() => {
                    console.error(`err loading ${reaction}.gif`);
                });
        } else {
            import(`./assets/animoji/static/${reaction}.svg`)
                ?.then((asset) => {
                    SET_asset(asset.default);
                })
                .catch(() => {
                    console.error(`err loading ${reaction}.svg`);
                });
        }
    }, [reaction]);

    if (asset) return <img className={classnames(classes.img, className)} src={asset} alt="" />;
    return null;
}

export default Animoji;
