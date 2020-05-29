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
        filter: 'opacity(0.4)',
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
    } = props.player;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
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
                [classes.hero]: hero,
            })}
            style={style}
            id={uuid}
        >
            {hero ? <Animoji /> : null}
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
            {sittingOut ? (
                <Typography className={classnames(classes.sittingOut)}>
                    <Typography className={classes.sittingOutText}>Sitting Out</Typography>
                </Typography>
            ) : (
                <Hand hand={hand} folded={folded} hero={hero} />
            )}
            <PlayerStack
                toAct={toAct}
                name={name}
                stack={stack}
                folded={folded}
                positionIndicator={positionIndicator}
                winner={winner}
            />
            <div>{playerTimer ? <PlayerTimer playerTimer={playerTimer} hero={hero} /> : null}</div>
        </div>
    );
}

export default Player;
