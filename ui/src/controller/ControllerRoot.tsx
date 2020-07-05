import React from 'react';

import classnames from 'classnames';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';

import { SELENIUM_TAGS } from '../shared/models/test/seleniumTags';
import ControllerSpectator from './ControllerSpectator';
import ControllerBetAction from './ControllerBetAction';
import ControllerGameInfo from './ControllerGameInfo';
import ControllerAdditionalGamePlay from './ControllerAdditionalGamePlay';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'absolute',
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            backgroundColor: grey[900],
            background: `linear-gradient(rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%);`,
        },
        gameInfoCont: {
            marginLeft: '2vw',
            height: '100%',
            width: '15%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'self-start',
            justifyContent: 'center',
        },
        sizeAndBetActionsCont: {
            width: '65%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
        },
        additionalGamePlayCont: {
            width: '20%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginRight: '2vw',
        },
        spectatorCont: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
    }),
);

export interface ControllerProps {
    className?: string;
}

// ControllerRoot defines basic visual structure of the controller
// remains unconnected to global state to avoid unecessary rerenders
function ControllerRoot(props: ControllerProps) {
    const classes = useStyles();
    const { className } = props;

    return (
        <div className={classnames(classes.root, className)} id={SELENIUM_TAGS.IDS.CONTROLLER_ROOT}>
            {/* Left-Most Game Info */}
            <ControllerGameInfo rootClassName={classes.gameInfoCont} />
            {/* Middle Betting Console */}
            <ControllerBetAction rootClassName={classes.sizeAndBetActionsCont} />
            {/* Right-Most Game Play Buttons */}
            <ControllerAdditionalGamePlay rootClassName={classes.additionalGamePlayCont} />
            {/* Full-Width Spectator Interface */}
            <ControllerSpectator rootClassName={classes.spectatorCont} />
        </div>
    );
}

ControllerRoot.displayName = 'ControllerRoot';

export default ControllerRoot;
