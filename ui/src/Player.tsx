import React, { useState } from 'react';
import classnames from 'classnames';

import Hand from './Hand';
import PlayerStack from './PlayerStack';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import blueGrey from '@material-ui/core/colors/blueGrey';
import grey from '@material-ui/core/colors/grey';

import PlayerTimer from './PlayerTimer';
import PlayerMenu from './PlayerMenu';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import Animoji from './Animoji';
import PlayerLabel from './PlayerLabel';

const PLAYER_WIDTH = 16;
const PLAYER_HEIGHT = 12;

const useStyles = makeStyles((theme) => ({
    root: {
        width: `${PLAYER_WIDTH}vmin`,
        height: `${PLAYER_HEIGHT}vmin`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        transform: 'translateY(-50%) translateX(-50%)',
    },
    folded: {
        opacity: 0.5,
    },

    labelText: {
        margin: '0.3vmin 0',
        width: '9vmin',
        textAlign: 'center',
        fontSize: '1.4vmin',
    },
    hero: {
        transform: 'translateY(-50%) translateX(-50%) scale(1.21)',
    },
    moreIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        marginRight: '0.4vmin',
        color: grey[700],
        '&:hover': {
            color: 'black',
        },
    },
}));

function Player(props) {
    const classes = useStyles();
    const { className, style, setHeroRotation, virtualPositon } = props;
    const {
        stack,
        hand,
        name,
        toAct,
        playerTimer,
        winner,
        positionIndicator,
        folded,
        uuid,
        sittingOut,
        hero,
        position,
    } = props.player;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
        event.preventDefault();
        setAnchorEl(event.currentTarget as any);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    function getplayerLabelComponent() {
        if (sittingOut) {
            return <Typography className={classes.labelText}>Sitting Out</Typography>;
        }
        if (folded) {
            return <Typography className={classes.labelText}>Folded</Typography>;
        }
        if (playerTimer) {
            return <PlayerTimer className={classes.labelText} playerTimer={playerTimer} hero={hero} />;
        }
        return undefined;
    }

    const playerLabelComponent = getplayerLabelComponent();

    return (
        <div
            className={classnames(classes.root, className, {
                [classes.folded]: folded || sittingOut,
                [classes.hero]: hero,
            })}
            style={style}
            id={uuid}
        >
            <MoreHoriz className={classes.moreIcon} onClick={handleClick} />
            <PlayerMenu
                handleClose={handleClose}
                anchorEl={anchorEl}
                uuid={uuid}
                name={name}
                stack={stack}
                setHeroRotation={setHeroRotation}
                virtualPositon={virtualPositon}
            />

            <Hand hand={hand} folded={folded} hero={hero} />

            <PlayerStack
                toAct={toAct}
                name={name}
                stack={stack}
                outOfHand={folded || sittingOut}
                positionIndicator={positionIndicator}
                winner={winner}
                position={position}
                playerUUID={uuid}
            />
            {playerLabelComponent ? <PlayerLabel>{playerLabelComponent}</PlayerLabel> : null}
        </div>
    );
}

export default Player;
