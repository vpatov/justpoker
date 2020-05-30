import React from 'react';
import classnames from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { genRandomInt } from './shared/util/util';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        img: {},
    }),
);

function Avatar(props) {
    const classes = useStyles();
    const { className, avatarKey } = props;

    const r = genRandomInt(0, 10000);
    return (
        <img
            className={classnames(classes.img, className)}
            src={`https://avatars.dicebear.com/api/bottts/test${r}.svg?options[colors][]=blue&options[primaryColorLevel]=50`}
            alt=""
        />
    );
}

export default Avatar;
