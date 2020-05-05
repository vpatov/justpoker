import React from 'react';
import { generateStringFromSuit, SUITS } from './utils';
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
    },
    text: {
        fontWeight: 'bold',
    },
    rank: {
        fontSize: '4.8vmin',
        lineHeight: '1em',
        position: 'absolute',
        top: '8%',
        left: '11%',
        color: 'white',
    },
    suit: {
        fontSize: '4.8vmin',
        lineHeight: '5vmin',
        position: 'absolute',
        bottom: '5%',
        right: '5%',
        color: 'white',
        opacity: 0.7,
    },
    // TODO change and make aesthetically pleasing. 
    partOfWinningHand: {
        boxShadow: "10px 10px 15px 15px #ffffdd"
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
        <div className={classnames(classes.root, classes[suit], className, {[classes.partOfWinningHand]: partOfWinningHand})}>
            <Typography className={classnames(classes.text, classes.rank)}>{rank}</Typography>
            <Typography className={classnames(classes.text, classes.suit)}>{generateStringFromSuit(suit)}</Typography>
        </div>
    );
}

export default CardLarge;
