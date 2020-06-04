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

export enum AvatarIds {
    nun = 'nun',
    welder = 'welder',
    priest = 'priest',
    astronaut = 'astronaut',
    ninja = 'ninja',
    soldier = 'soldier',
    cooker = 'cooker',
    diver = 'diver',
    farmer = 'farmer',
    soak = 'soak',
    postman = 'postman',
    hacker = 'hacker',
    doctor = 'doctor',
    elegance = 'elegance',
    gambler = 'gambler',
    'gambler-1' = 'gambler-1',
    king = 'king',
    queen = 'queen',
    armor = 'armor',
    executioner = 'executioner',
    jester = 'jester',
    'frog-prince' = 'frog-prince',
    dinosaur = 'dinosaur',
    shark = 'shark',
    whale = 'whale',
    penguin = 'penguin',
    gnome = 'gnome',
    chicken = 'chicken',
    horse = 'horse',
    robot = 'robot',
    'robot-1' = 'robot-1',
    'robot-2' = 'robot-2',
    'robot-3' = 'robot-3',
    'robot-4' = 'robot-4',
    alien = 'alien',
    dracula = 'dracula',
    'hip-hop' = 'hip-hop',
    batman = 'batman',
    spiderman = 'spiderman',
    dancer = 'dancer',
    'old-man' = 'old-man',
    woman = 'woman',
    grandmother = 'grandmother',
    grandfather = 'grandfather',
    'arab-woman' = 'arab-woman',
    shirt = 'shirt',
}
const AvatarVals = Object.values(AvatarIds);

function Avatar(props) {
    const classes = useStyles();
    const { className, playerUUID } = props;
    const r = genRandomInt(0, AvatarVals.length - 1);

    return (
        <svg className={classnames(classes.svg, className)}>
            <use className={classes.use} href={`${AvatarsSvg}#${AvatarVals[r]}`} />
        </svg>
    );
}

export default Avatar;
