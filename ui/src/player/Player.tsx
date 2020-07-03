import React, { useState } from 'react';
import classnames from 'classnames';

import Hand from './Hand';
import PlayerStack from './PlayerStack';
import { useSelector } from 'react-redux';
import { heroPlayerUUIDSelector, selectCanShowHideCards } from '../store/selectors';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import grey from '@material-ui/core/colors/grey';
import MoreIcon from '@material-ui/icons/MoreHoriz';

import PlayerTimer from './PlayerTimer';
import PlayerMenu from './PlayerMenu';
import PlayerLabel from './PlayerLabel';
import { IconButton, Button } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        width: `${theme.custom.PLAYER_WIDTH}vmin`,
        height: `${theme.custom.PLAYER_HEIGHT}vmin`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        filter: 'drop-shadow(0 0.4vmin 0.4vmin rgba(0,0,0,0.9))',
        transform: 'translateY(-50%) translateX(-50%)',
        '&:hover $showAllButton': {
            opacity: 1,
        },
    },
    outOfHand: {
        opacity: 0.34,
        filter: 'grayscale(100%)',
    },
    labelText: {
        margin: '0.3vmin 0.8vmin',
        minWidth: '4vmin',
        maxWidth: '90%',
        textAlign: 'center',
        fontSize: '1.5vmin',
    },

    hero: {
        zIndex: 1,
        transform: 'translateY(-50%) translateX(-50%) scale(1.2)',
    },

    moreButton: {
        zIndex: 10,
        position: 'absolute',
        bottom: '0',
        right: 0,
        padding: '0.3vmin',
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
        borderRadius: '0.6vmin',
    },
    moreIcon: {
        color: grey[900],
    },
    showAllButton: {
        opacity: 0,
        padding: '0.6vmin 0.4vmin',
        position: 'absolute',
        fontSize: '1.4vmin',
        bottom: '10%',
        left: '50%',
        width: '70%',
        transform: 'translateX(-50%)',
    },
}));

function Player(props) {
    const classes = useStyles();
    const { className, player, style, setHeroRotation, virtualPositon } = props;
    const { hand, playerTimer, folded, uuid, sittingOut, hero, lastAction } = player;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const canShowHideCards = useSelector(selectCanShowHideCards);

    const handleClick = (event: any) => {
        event.preventDefault();
        setAnchorEl(event.currentTarget as any);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    function showCard() {
        // WsServer.sendShowCardMessage(heroPlayerUUID as PlayerUUID, [{ suit, rank } as Card]);
    }

    function getPlayerLabelComponent() {
        if (lastAction) {
            return <Typography className={classes.labelText}>{lastAction}</Typography>;
        }

        if (playerTimer) {
            return <PlayerTimer className={classes.labelText} playerTimer={playerTimer} hero={hero} />;
        }

        return null;
    }

    const playerLabelComponent = getPlayerLabelComponent();

    return (
        <div
            className={classnames(classes.root, className, {
                [classes.outOfHand]: folded || sittingOut,
                [classes.hero]: hero,
            })}
            style={style}
            id={uuid}
        >
            <PlayerMenu
                handleClose={handleClose}
                anchorEl={anchorEl}
                player={player}
                setHeroRotation={setHeroRotation}
                virtualPositon={virtualPositon}
            />

            <Hand hand={hand} folded={folded} hero={hero} />

            <PlayerStack player={player} onClickStack={handleClick} />
            <IconButton className={classes.moreButton} onClick={handleClick}>
                <MoreIcon className={classes.moreIcon} />
            </IconButton>
            {canShowHideCards && hero ? (
                <Button onClick={showCard} variant="contained" className={classes.showAllButton}>
                    Show All Cards
                </Button>
            ) : null}
            {playerLabelComponent ? <PlayerLabel>{playerLabelComponent}</PlayerLabel> : null}
        </div>
    );
}

export default Player;
