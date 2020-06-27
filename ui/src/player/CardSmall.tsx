import React, { useEffect } from 'react';
import { usePrevious } from '../utils';
import { flipCard } from '../game/AnimiationModule';
import { generateStringFromRank, SUITS } from '../utils';
import classnames from 'classnames';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Suit from '../reuseable/Suit';
import { Tooltip } from '@material-ui/core';
import { grey, blueGrey } from '@material-ui/core/colors';

const NORMAL_CARD_SIZE = '3.6vmin';
const SIZE_CARD_SIZE = '2.5vmin';

const useStyles = makeStyles((theme) => ({
    root: {
        borderRadius: 6,
        textAlign: 'center',
        position: 'relative',
        backgroundColor: 'white',
        height: '8.8vmin',
        width: '6.7vmin',
        display: 'flex',
        justifyContent: 'space-evenly',
        margin: '0 0.5vmin',
        boxShadow: '0vmin 0px 0.5vmin 0vmin rgba(0,0,0,0.5)',
    },
    sideCard: {
        margin: '0 -1.5vmin',
        boxShadow: '-0.2vmin 0px 0.8vmin 0px rgba(0,0,0,0.75)',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        justifyContent: 'flex-start',
    },
    rank: {
        letterSpacing: '-0.4vmin',
        position: 'absolute',
        fontSize: NORMAL_CARD_SIZE,
        lineHeight: NORMAL_CARD_SIZE,
        fontWeight: 'bold',
        top: '6%',
        left: '10%',
    },
    suit: {
        position: 'absolute',
        width: NORMAL_CARD_SIZE,
        height: NORMAL_CARD_SIZE,
        top: '40%',
        right: '3%',
    },
    sideRank: {
        fontWeight: 'bold',
        marginTop: '0.2vmin',
        marginLeft: '0.5vmin',
        width: '100%',
        textAlign: 'left',
        fontSize: SIZE_CARD_SIZE,
    },
    sideSuit: {
        marginLeft: '0.4vmin',
        textAlign: 'left',
        width: SIZE_CARD_SIZE,
        height: SIZE_CARD_SIZE,
    },
    hidden: {
        backgroundColor: grey[900],
    },
    hiddenText: {
        marginTop: '20%',
        fontWeight: 'bold',
        fontSize: '3vmin',
        color: theme.palette.primary.light,
    },
    sideTextHidden: {
        marginLeft: '20%',
        fontSize: '3vmin',
    },
    [SUITS.HEARTS]: {
        ...theme.custom.HEARTS,
    },
    [SUITS.SPADES]: {
        ...theme.custom.SPADES,
    },
    [SUITS.CLUBS]: {
        ...theme.custom.CLUBS,
    },
    [SUITS.DIAMONDS]: {
        ...theme.custom.DIAMONDS,
    },
}));

function CardSmall(props) {
    const classes = useStyles();
    const { suit, rank, hidden, className, shouldFlex, partOfWinningHand, isBeingShown, hero } = props;
    const cardId = `${suit}-${rank}`;
    const prevIsBeingShown = usePrevious(isBeingShown);

    useEffect(() => {
        if (!prevIsBeingShown && isBeingShown) {
            flipCard(cardId, hero);
        }
    }, [isBeingShown, prevIsBeingShown]);

    if (hidden) {
        return (
            <div className={classnames(classes.root, classes.hidden, { [classes.sideCard]: shouldFlex }, className)}>
                <Typography className={classnames(classes.hiddenText, { [classes.sideTextHidden]: shouldFlex })}>
                    JP
                </Typography>
            </div>
        );
    }

    const visibleCardComponent = (
        <div
            className={classnames(classes.root, classes[suit], className, {
                ani_notWinningCard: !partOfWinningHand,
                [classes.sideCard]: shouldFlex,
            })}
            id={cardId}
        >
            <Typography
                className={shouldFlex ? classes.sideRank : classes.rank}
                style={rank === 'T' ? { marginLeft: '-0.5%', left: '2%' } : {}}
            >
                {generateStringFromRank(rank)}
            </Typography>
            <Suit suit={suit} className={shouldFlex ? classes.sideSuit : classes.suit} />
        </div>
    );

    if (isBeingShown && hero) {
        return (
            <Tooltip placement="top" title="This card is flipped and is visible to all players.">
                {visibleCardComponent}
            </Tooltip>
        );
    }
    return visibleCardComponent;
}

export default CardSmall;
