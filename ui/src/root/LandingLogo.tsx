import React from 'react';
import classnames from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { ReactComponent as LogoA } from '../assets/logo/landingLogoA.svg';
import { ReactComponent as LogoB } from '../assets/logo/landingLogoB.svg';
import { genRandomInt } from '../shared/util/util';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        svg: {
            // filter: `drop-shadow(0px 0px 3px rgba(0, 0, 0, .7))`,
        },
        use: {},
    }),
);

function LandingLogo(props) {
    const classes = useStyles();
    const { className } = props;

    return genRandomInt(0, 1) === 1 ? (
        <LogoA className={classnames(classes.svg, className)} />
    ) : (
        <LogoB className={classnames(classes.svg, className)} />
    );
}

export default LandingLogo;
