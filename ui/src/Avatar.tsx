import React from 'react';
import classnames from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { genRandomInt } from './shared/util/util';
import AvatarsSvg from './assets/avatars/avatars.svg';
import { AvatarIds } from './shared/models/assets';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        svg: {
            filter: `drop-shadow(0px 0px 3px rgba(0, 0, 0, .7))`,
        },
        use: {},
    }),
);

const AvatarVals = Object.values(AvatarIds);

function Avatar(props) {
    const classes = useStyles();
    const { className, avatarKey } = props;

    function getHref() {
        let id = '';
        if (avatarKey) {
            id = AvatarIds[avatarKey];
        } else {
            const r = genRandomInt(0, AvatarVals.length - 1);
            id = Object.values(AvatarIds)[r];
        }
        return `${AvatarsSvg}#${id}`;
    }

    return (
        <svg className={classnames(classes.svg, className)}>
            <use className={classes.use} href={getHref()} />
        </svg>
    );
}

export default Avatar;
