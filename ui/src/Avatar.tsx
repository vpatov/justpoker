import React from 'react';
import classnames from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { genRandomInt } from './shared/util/util';
import AvatarsSvg from './assets/avatars/avatars.svg';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        svg: {
            filter: `drop-shadow(0px 0px 3px rgba(0, 0, 0, .7))`,
        },
        use: {},
    }),
);

const AVATAR_IDS = [
    '#dinosaur',
    '#shark',
    '#fish-1',
    '#skeleton',
    '#whale',
    '#king',
    '#gambler-1',
    '#robot-4',
    '#moon',
    '#batman',
    '#diver',
    '#cooker',
    '#priest',
    '#loader',
    '#grandmother',
    '#grandfather',
    '#death',
    '#soak',
    '#horse',
    '#robot-2',
    '#armor',
    '#frog-prince',
    '#jester',
    '#executioner',
    '#disco',
    '#elegance',
    '#shirt',
    '#woman',
    '#arab-woman',
    '#penguin',
    '#hacker',
    '#soldier',
    '#photographer',
    '#farmer',
    '#dinosaur-4',
    '#firefighter',
    '#gnome',
    '#dracula',
];

function Avatar(props) {
    const classes = useStyles();
    const { className, playerUUID } = props;

    const r = genRandomInt(0, AVATAR_IDS.length - 1);

    return (
        <svg className={classnames(classes.svg, className)}>
            <use className={classes.use} href={`${AvatarsSvg}${AVATAR_IDS[r]}`} />
        </svg>
    );
}

export default Avatar;
