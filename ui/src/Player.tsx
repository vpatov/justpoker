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
import MoreIcom from '@material-ui/icons/MoreVert';
import Animoji from './Animoji';
import PlayerLabel from './PlayerLabel';

const useStyles = makeStyles((theme) => ({
    root: {
        width: `${theme.custom.PLAYER_WIDTH}vmin`,
        height: `${theme.custom.PLAYER_HEIGHT}vmin`,
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
        zIndex: 10,
        position: 'absolute',
        bottom: '3%',
        right: 0,
        marginRight: '0vmin',
        color: grey[700],
        '&:hover': {
            color: 'black',
        },
    },
    winnerAnimoji: {
        width: `${theme.custom.PLAYER_WIDTH}vmin`,
        height: `${theme.custom.PLAYER_WIDTH}vmin`,
        position: 'absolute',
        // zIndex: -1,
    },
}));

function Player(props) {
    const classes = useStyles();
    const { className, player, style, setHeroRotation, virtualPositon } = props;
    const { stack, hand, name, playerTimer, folded, uuid, sittingOut, hero, winner } = player;
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
            {/* {winner ? <Animoji reaction={'winner'} className={classes.winnerAnimoji} animated /> : null} */}
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

            <PlayerStack onClickStack={handleClick} player={player} />
            {playerLabelComponent ? <PlayerLabel>{playerLabelComponent}</PlayerLabel> : null}
        </div>
    );
}

export default Player;
