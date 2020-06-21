import React, { useEffect } from 'react';
import { usePrevious } from '../utils';
import { animateWinningCards } from '../game/AnimiationModule';
import { generateStringFromRank, SUITS } from '../utils';
import classnames from 'classnames';
import Suit from '../reuseable/Suit';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { ASPECT_RATIO_BREAK_POINT } from '../style/Theme';

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

    smallWidth: {
        '& > *': {
            fontSize: '4vmin',
            width: '4vmin',
            height: '4vmin',
        },
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
    const smallWidth = useMediaQuery(ASPECT_RATIO_BREAK_POINT);

    // this function could be located in many different componets
    // we could also do it at a global level, maybe the animation module is peforming these diff?
    // or we could do it explictly as part of the backend animation flow
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
                ani_notWinningCard: !partOfWinningHand,
                [classes.smallWidth]: smallWidth,
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
