import React, { useState, useRef } from 'react';
import classnames from 'classnames';
import Hand from './Hand';
import PlayerStack from './PlayerStack';
import { animateWinner } from './AnimiationModule';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import blueGrey from '@material-ui/core/colors/blueGrey';
import PlayerTimer from './PlayerTimer';
import PlayerMenu from './PlayerMenu';

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
        ...theme.custom.FOLDED,
    },
    sittingOut: {
        width: '80%',
        margin: '0 auto',
        borderTopLeftRadius: '1vmin',
        borderTopRightRadius: '1vmin',
        backgroundColor: blueGrey[400],
        display: 'flex',
        justifyContent: 'space-evenly',
    },
    sittingOutText: {
        marginTop: '3%',
        marginBottom: '10%',
        fontSize: '1.6vmin',
    },
    hero: {
        transform: 'translateY(-50%) translateX(-50%) scale(1.21)',
    },
}));

function Player(props) {
    const classes = useStyles();
    const { className, style, setHeroRotation, virtualPositon } = props;
    const { stack, hand, name, toAct, playerTimer, winner, button, folded, uuid, sittingOut, hero } = props.player;
    const playerEl = useRef(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        setAnchorEl(event.currentTarget as any);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    if (winner) {
        setTimeout(() => animateWinner(playerEl), 300);
    }

    return (
        <div
            ref={playerEl}
            className={classnames(classes.root, className, {
                [classes.folded]: folded || sittingOut,
                [classes.hero]: hero,
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
                <Typography className={classnames(classes.sittingOut, { [classes.hero]: hero })}>
                    <Typography className={classes.sittingOutText}>Sitting Out</Typography>
                </Typography>
            ) : (
                <Hand hand={hand} />
            )}
            <PlayerStack toAct={toAct} name={name} stack={stack} button={button} winner={winner} />
            <div>{playerTimer ? <PlayerTimer playerTimer={playerTimer} hero={hero} /> : null}</div>
        </div>
    );
}

export default Player;
