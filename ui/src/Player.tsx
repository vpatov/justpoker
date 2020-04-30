import React, { useState } from 'react';
import classnames from 'classnames';
import Hand from './Hand';
import PlayerStack from './PlayerStack';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import blueGrey from '@material-ui/core/colors/blueGrey';
import PlayerTimer from './PlayerTimer';
import PlayerMenu from './PlayerMenu';

const PLAYER_WIDTH = 16;
const PLAYER_HEIGHT = 13;
const HERO_SCALE = 1.2;
const useStyles = makeStyles((theme) => ({
    root: {
        width: `${PLAYER_WIDTH}vmin`,
        // height: `${PLAYER_HEIGHT}vmin`,
    },
    playerHero: {
        // width: `${PLAYER_WIDTH * HERO_SCALE}vmin`,
        // height: `${PLAYER_HEIGHT * HERO_SCALE}vmin`,
    },
    folded: {
        ...theme.custom.FOLDED,
    },
    sittingOut: {
        width: '100%',
        height: '7vmin',
        borderTopLeftRadius: '2vmin',
        borderTopRightRadius: '2vmin',
        backgroundColor: blueGrey[400],
        display: 'flex',
        justifyContent: 'space-evenly',
    },
    sittingOutText: {
        marginTop: '5%',
        fontSize: '2vmin',
    },
}));

function Player(props) {
    const classes = useStyles();
    const { className, style, setHeroRotation, virtualPositon } = props;
    const { stack, hand, name, toAct, playerTimer, winner, button, folded, uuid, sittingOut, hero } = props.player;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        setAnchorEl(event.currentTarget as any);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div
            className={classnames(classes.root, className, {
                [classes.folded]: folded || sittingOut,
                [classes.playerHero]: hero,
            })}
            style={style}
            onContextMenu={handleClick}
        >
            <PlayerMenu
                handleClose={handleClose}
                anchorEl={anchorEl}
                uuid={uuid}
                name={name}
                stack={stack}
                setHeroRotation={setHeroRotation}
                virtualPositon={virtualPositon}
            />
            {sittingOut ? (
                <Typography className={classes.sittingOut}>
                    <Typography className={classes.sittingOutText}>Sitting Out</Typography>
                </Typography>
            ) : (
                <Hand hand={hand} />
            )}
            <PlayerStack toAct={toAct} name={name} stack={stack} button={button} winner={winner} />
            <div>{playerTimer ? <PlayerTimer playerTimer={playerTimer} /> : null}</div>
        </div>
    );
}

export default Player;
