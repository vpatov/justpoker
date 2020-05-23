import React, { useEffect } from 'react';
import { usePrevious } from './utils';
import { animateWinningCards } from './AnimiationModule';
import { generateStringFromSuit, generateStringFromRank, SUITS } from './utils';
import classnames from 'classnames';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Suit from './Suit';

const useStyles = makeStyles((theme) => ({
    root: {
        borderRadius: 6,
        display: 'inline-block',
        textAlign: 'center',
        position: 'relative',
        backgroundColor: 'white',
        height: '11vmin',
        width: '8.6vmin',
        margin: '0.5vmin',
        overflow: 'hidden',
        transform: 'translateY(0)',
        transition: 'transform 0.5s ease-in-out',
    },
    text: {
        letterSpacing: '-0.5vmin',
        fontWeight: 'bold',
    },
    rank: {
        fontSize: '4.8vmin',
        lineHeight: '1em',
        position: 'absolute',
        top: '5%',
        left: '10%',
    },
    suit: {
        width: '4.8vmin',
        height: '4.8vmin',
        position: 'absolute',
        bottom: '5%',
        right: '5%',
    },
    partOfWinningHand: {
        transform: 'translateY(33%)',
        ...theme.custom.WINNING_CARD,
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

function CardLarge(props) {
    const classes = useStyles();
    const { suit, rank, partOfWinningHand, className } = props;

    const prevWinner = usePrevious(partOfWinningHand);
    useEffect(() => {
        if (!prevWinner && partOfWinningHand) {
            animateWinningCards();
        }
    }, [prevWinner, partOfWinningHand]);

    return (
        <div
            className={classnames(classes.root, classes[suit], className, {
                [classes.partOfWinningHand]: partOfWinningHand,
                ['ani_notWinningCard']: !partOfWinningHand,
            })}
        >
            <Typography
                className={classnames(classes.text, classes.rank)}
                style={rank === 'T' ? { marginLeft: '-0.5vmin' } : {}}
            >
                {generateStringFromRank(rank)}
            </Typography>
            <Suit suit={suit} className={classes.suit} />
        </div>
    );
}

export default CardLarge;
