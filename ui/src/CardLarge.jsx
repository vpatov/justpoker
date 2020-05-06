import React from 'react';
import { generateStringFromSuit, generateStringFromRank, SUITS } from './utils';
import classnames from 'classnames';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

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
        fontSize: '4.8vmin',
        lineHeight: '5vmin',
        position: 'absolute',
        bottom: '5%',
        right: '5%',
        opacity: 0.7,
    },
    partOfWinningHand: {
        transform: 'translateY(33%)',
        transition: 'transform 0.5s ease-in-out',
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

    return (
        <div
            className={classnames(classes.root, classes[suit], className, {
                [classes.partOfWinningHand]: partOfWinningHand,
            })}
        >
            <Typography className={classnames(classes.text, classes.rank)}>{generateStringFromRank(rank)}</Typography>
            <Typography className={classnames(classes.text, classes.suit)}>{generateStringFromSuit(suit)}</Typography>
        </div>
    );
}

export default CardLarge;
